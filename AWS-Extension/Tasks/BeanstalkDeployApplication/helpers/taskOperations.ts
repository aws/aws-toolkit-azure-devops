import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import Q = require('q');
import archiver = require('archiver');
import awsBeanstalkClient = require('aws-sdk/clients/elasticbeanstalk');
import awsS3Client = require('aws-sdk/clients/s3');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async deploy(taskParameters: TaskParameters.DeployTaskParameters): Promise<void> {
        this.constructServiceClients(taskParameters);

        const versionLabel = 'v' + new Date().getTime();

        const s3Bucket = await this.determineS3Bucket();

        let deploymentBundle : string;
        if(taskParameters.applicationType == taskParameters.applicationTypeAspNetCoreForWindows) {
            deploymentBundle = await this.prepareAspNetCoreBundle(taskParameters.dotnetPublishPath);
        }
        else {
            deploymentBundle = taskParameters.webDeploymentArchive;
        }

        const s3Key = await this.uploadApplication(deploymentBundle, s3Bucket, taskParameters.applicationName, taskParameters.environmentName, versionLabel);

        const startingEventDate = await this.getLatestEventDate(taskParameters.applicationName, taskParameters.environmentName);

        await this.updateEnvironment(s3Bucket, s3Key, taskParameters.applicationName, taskParameters.environmentName, versionLabel);

        await this.waitForDeploymentCompletion(taskParameters.applicationName, taskParameters.environmentName, startingEventDate);

        console.log(tl.loc('TaskCompleted', taskParameters.applicationName));
    }

    private static beanstalkClient: awsBeanstalkClient;
    private static s3Client: awsS3Client;

    private static constructServiceClients(taskParameters: TaskParameters.DeployTaskParameters) {

        this.beanstalkClient = new awsBeanstalkClient({
            apiVersion: '2010-12-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        });

        this.s3Client = new awsS3Client({
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        });
    }

    private static async prepareAspNetCoreBundle(dotnetPublishPath : string) : Promise<string> {

        var defer = Q.defer();
        var deploymentBundle = tl.getVariable('build.artifactStagingDirectory') + '/ebDeploymentBundle.zip';
        let output = fs.createWriteStream(deploymentBundle);
        console.log(tl.loc('CreatingBeanstalkBundle', deploymentBundle));

        let archive = archiver('zip');

        output.on('close', function() {
            console.log(tl.loc('ArchiveSize', archive.pointer()));
            defer.resolve(deploymentBundle);
        });
                
        archive.on('error', function(err) {
            console.log(tl.loc('ZipError', err))
            defer.reject(err);
        });

        archive.pipe(output);

        console.log(tl.loc('PublishingPath', dotnetPublishPath));
        var stat = fs.statSync(dotnetPublishPath);
        if(stat.isFile()) {
            archive.file(dotnetPublishPath, {name: path.basename(dotnetPublishPath)});
            console.log(tl.loc('AddingAspNetCoreBundle',  dotnetPublishPath));

            var manifest = this.generateManifest('./' + path.basename(dotnetPublishPath), '/');
            archive.append(manifest, {name : 'aws-windows-deployment-manifest.json'});
            console.log(tl.loc('AddingManifest'));
        }
        else {
            archive.directory(dotnetPublishPath, '/app/');
            console.log(tl.loc('AddingFilesFromDotnetPublish'));

            var manifest = this.generateManifest('/app/', '/');
            archive.append(manifest, {name : 'aws-windows-deployment-manifest.json'});
            console.log(tl.loc('AddingManifest'));
        }

        archive.finalize();
        await defer.promise;

        console.log(tl.loc('BundleComplete'));
        return deploymentBundle;
    }

    private static generateManifest(appBundle: string, iisPath: string) : string {

        var manifest = 
`{
  "manifestVersion": 1,
  "deployments": {
 
    "aspNetCoreWeb": [
      {
        "name": "app",
        "parameters": {
          "appBundle": "` + appBundle + `",
          
          "iisPath": "` + iisPath + `",
          "iisWebSite": "Default Web Site"
        }
      }
    ]
  }
}`;
                
        return manifest;
    }

    private static async updateEnvironment(bucketName: string, key: string,application: string, environment: string, versionLabel: string ): Promise<void> {

        const sourceBundle: awsBeanstalkClient.S3Location = {
            'S3Bucket' : bucketName,
            'S3Key' : key
        };

        const versionRequest: awsBeanstalkClient.CreateApplicationVersionMessage = {
            'ApplicationName' : application,
            'VersionLabel' : versionLabel,
            'SourceBundle' : sourceBundle
        };

        await this.beanstalkClient.createApplicationVersion(versionRequest).promise();
        console.log(tl.loc('CreatedApplicationVersion', versionRequest.VersionLabel));

        const request: awsBeanstalkClient.UpdateEnvironmentMessage = {
            'ApplicationName' : application,
            'EnvironmentName' : environment,
            'VersionLabel' : versionLabel
        };
        await this.beanstalkClient.updateEnvironment(request).promise();
        console.log(tl.loc('StartingApplicationDeployment', request.VersionLabel));
    }

    private static async determineS3Bucket() : Promise<string> {
        const response = await this.beanstalkClient.createStorageLocation().promise();
        console.log(tl.loc('DeterminedBucket', response.S3Bucket));
        return response.S3Bucket;
    }

    private static async uploadApplication(applicationBundlePath: string, bucketName: string, application: string, environment: string, versionLabel: string): Promise<string> {

        let key: string;
        key = application + '/' + environment + '/' + path.basename(applicationBundlePath, '.zip') + '-' + versionLabel + '.zip';

        console.log(tl.loc('UploadingBundle', applicationBundlePath, key, bucketName));
        const fileBuffer = fs.createReadStream(applicationBundlePath);
        try {
            const response: awsS3Client.ManagedUpload.SendData = await this.s3Client.upload({
                Bucket: bucketName,
                Key: key,
                Body: fileBuffer
            }).promise();
            console.log(tl.loc('BundleUploadCompleted'));
            return key;
        } catch (err) {
            console.error(tl.loc('BundleUploadFailed', err.message), err);
            throw err;
        }
    }

    private static async waitForDeploymentCompletion(applicationName: string, environmentName: string, startingEventDate : Date) : Promise<void> {

        const requestEnvironment : awsBeanstalkClient.DescribeEnvironmentsMessage = {
            'ApplicationName': applicationName,
            'EnvironmentNames' : [environmentName]
        };

        const requestEvents : awsBeanstalkClient.DescribeEventsMessage = {
            'ApplicationName': applicationName,
            'EnvironmentName' : environmentName,
            'StartTime' : startingEventDate
        };

        let lastPrintedEventDate = startingEventDate;

        console.log(tl.loc('WaitingForDeployment'));
        console.log(tl.loc('EventsComing'));

        let success = true;
        let environment : awsBeanstalkClient.EnvironmentDescription;
        do {
            await this.sleep(5000);

            const responseEnvironments = await this.beanstalkClient.describeEnvironments(requestEnvironment).promise();
            if (responseEnvironments.Environments.length === 0) {
                throw new Error(tl.loc('FailedToFindEnvironment'));
            }
            environment = responseEnvironments.Environments[0];

            requestEvents.StartTime = lastPrintedEventDate;
            const responseEvent = await this.beanstalkClient.describeEvents(requestEvents).promise();

            if (responseEvent.Events.length > 0) {
                for (let i = responseEvent.Events.length - 1; i >= 0; i--) {
                    const event = responseEvent.Events[i];
                    if (event.EventDate <= lastPrintedEventDate) {
                        continue;
                    }

                    console.log(event.EventDate + '   ' + event.Severity + '   ' + event.Message);

                    if(event.Message == 'Failed to deploy application.') {
                        success = false;
                    }
                }

                lastPrintedEventDate = responseEvent.Events[0].EventDate;
            }

        } while (environment.Status === 'Launching' || environment.Status === 'Updating');

        if(!success) {
            throw new Error(tl.loc('FailedToDeploy'));
        }
    }

    private static async getLatestEventDate(applicationName: string, environmentName: string) : Promise<Date> {

        const requestEvents : awsBeanstalkClient.DescribeEventsMessage = {
            'ApplicationName': applicationName,
            'EnvironmentName' : environmentName
        };

        const response = await this.beanstalkClient.describeEvents(requestEvents).promise();
        if (response.Events.length === 0) {
            return new Date();
        }

        return response.Events[0].EventDate;
    }

    private static sleep(timeout: number) : Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, timeout);
        });
    } 
}
