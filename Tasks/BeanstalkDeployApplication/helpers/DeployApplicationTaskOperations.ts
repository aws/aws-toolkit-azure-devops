/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import Q = require('q');
import archiver = require('archiver');
import Beanstalk = require('aws-sdk/clients/elasticbeanstalk');
import S3 = require('aws-sdk/clients/s3');
import Parameters = require('./DeployApplicationTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async deploy(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.constructServiceClients(taskParameters);

        await this.verifyResourcesExist(taskParameters.applicationName, taskParameters.environmentName);

        let versionLabel: string;
        if (taskParameters.versionLabel) {
            versionLabel = taskParameters.versionLabel;
        } else {
            versionLabel = 'v' + new Date().getTime();
        }

        const s3Bucket = await this.determineS3Bucket();

        let deploymentBundle : string;
        if (taskParameters.applicationType === taskParameters.applicationTypeAspNetCoreForWindows) {
            deploymentBundle = await this.prepareAspNetCoreBundle(taskParameters.dotnetPublishPath);
        } else {
            deploymentBundle = taskParameters.webDeploymentArchive;
        }

        const s3Key = await this.uploadApplication(deploymentBundle, s3Bucket, taskParameters.applicationName, taskParameters.environmentName, versionLabel);

        const startingEventDate = await this.getLatestEventDate(taskParameters.applicationName, taskParameters.environmentName);

        await this.updateEnvironment(s3Bucket, s3Key, taskParameters.applicationName, taskParameters.environmentName, versionLabel);

        await this.waitForDeploymentCompletion(taskParameters.applicationName, taskParameters.environmentName, startingEventDate);

        console.log(tl.loc('TaskCompleted', taskParameters.applicationName));
    }

    private static beanstalkClient: Beanstalk;
    private static s3Client: S3;

    private static async constructServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const beanstalkOpts: Beanstalk.ClientConfiguration = {
            apiVersion: '2010-12-01',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.beanstalkClient = sdkutils.createAndConfigureSdkClient(Beanstalk, beanstalkOpts, taskParameters, tl.debug);

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.s3Client = sdkutils.createAndConfigureSdkClient(S3, s3Opts, taskParameters, tl.debug);
    }

    private static async prepareAspNetCoreBundle(dotnetPublishPath : string) : Promise<string> {

        const defer = Q.defer();

        const tempDirectory = sdkutils.getTempLocation();
        const deploymentBundle = tempDirectory + '/ebDeploymentBundle.zip';
        const output = fs.createWriteStream(deploymentBundle);
        console.log(tl.loc('CreatingBeanstalkBundle', deploymentBundle));

        const archive = archiver('zip');

        output.on('close', function() {
            console.log(tl.loc('ArchiveSize', archive.pointer()));
            defer.resolve(deploymentBundle);
        });

        archive.on('error', function(err: any) {
            console.log(tl.loc('ZipError', err));
            defer.reject(err);
        });

        archive.pipe(output);

        console.log(tl.loc('PublishingPath', dotnetPublishPath));
        const stat = fs.statSync(dotnetPublishPath);
        if (stat.isFile()) {
            archive.file(dotnetPublishPath, {name: path.basename(dotnetPublishPath)});
            console.log(tl.loc('AddingAspNetCoreBundle',  dotnetPublishPath));

            const manifest = this.generateManifest('./' + path.basename(dotnetPublishPath), '/');
            archive.append(manifest, {name : 'aws-windows-deployment-manifest.json'});
            console.log(tl.loc('AddingManifest'));
        } else {
            archive.directory(dotnetPublishPath, '/app/');
            console.log(tl.loc('AddingFilesFromDotnetPublish'));

            const manifest = this.generateManifest('/app/', '/');
            archive.append(manifest, {name : 'aws-windows-deployment-manifest.json'});
            console.log(tl.loc('AddingManifest'));
        }

        archive.finalize();
        await defer.promise;

        console.log(tl.loc('BundleComplete'));
        return deploymentBundle;
    }

    private static generateManifest(appBundle: string, iisPath: string) : string {

        const manifest =
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

    private static async updateEnvironment(bucketName: string, key: string, application: string, environment: string, versionLabel: string ): Promise<void> {

        const sourceBundle: Beanstalk.S3Location = {
            'S3Bucket' : bucketName,
            'S3Key' : key
        };

        const versionRequest: Beanstalk.CreateApplicationVersionMessage = {
            'ApplicationName' : application,
            'VersionLabel' : versionLabel,
            'SourceBundle' : sourceBundle
        };

        await this.beanstalkClient.createApplicationVersion(versionRequest).promise();
        console.log(tl.loc('CreatedApplicationVersion', versionRequest.VersionLabel));

        const request: Beanstalk.UpdateEnvironmentMessage = {
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
            const response: S3.ManagedUpload.SendData = await this.s3Client.upload({
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

        const requestEnvironment : Beanstalk.DescribeEnvironmentsMessage = {
            'ApplicationName': applicationName,
            'EnvironmentNames' : [environmentName]
        };

        const requestEvents : Beanstalk.DescribeEventsMessage = {
            'ApplicationName': applicationName,
            'EnvironmentName' : environmentName,
            'StartTime' : startingEventDate
        };

        let lastPrintedEventDate = startingEventDate;

        console.log(tl.loc('WaitingForDeployment'));
        console.log(tl.loc('EventsComing'));

        let success = true;
        let environment : Beanstalk.EnvironmentDescription;
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

                    if (event.Message === 'Failed to deploy application.') {
                        success = false;
                    }
                }

                lastPrintedEventDate = responseEvent.Events[0].EventDate;
            }

        } while (environment.Status === 'Launching' || environment.Status === 'Updating');

        if (!success) {
            throw new Error(tl.loc('FailedToDeploy'));
        }
    }

    private static async getLatestEventDate(applicationName: string, environmentName: string) : Promise<Date> {

        const requestEvents : Beanstalk.DescribeEventsMessage = {
            'ApplicationName': applicationName,
            'EnvironmentName' : environmentName
        };

        const response = await this.beanstalkClient.describeEvents(requestEvents).promise();
        if (response.Events.length === 0) {
            return new Date();
        }

        return response.Events[0].EventDate;
    }

    private static sleep(timeout: number) : Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, timeout);
        });
    }

    private static async verifyResourcesExist(applicationName: string, environmentName: string): Promise<void> {

        let appExists: boolean = false;
        let envExists: boolean = false;

        try {
            const response = await this.beanstalkClient.describeApplications({
                ApplicationNames: [ applicationName ]
            }).promise();

            appExists = response.Applications.length === 1;
        // tslint:disable-next-line:no-empty
        } catch (err) {
        }

        if (!appExists) {
           throw new Error(tl.loc('ApplicationDoesNotExist', applicationName));
         }

        try {
            const response = await this.beanstalkClient.describeEnvironments({
                ApplicationName: applicationName,
                EnvironmentNames: [ environmentName ]
            }).promise();

            envExists = response.Environments.length === 1;
        // tslint:disable-next-line:no-empty
        } catch (err) {
        }

        if (!envExists) {
            throw new Error(tl.loc('EnvironmentDoesNotExist', environmentName, applicationName));
        }
    }

}
