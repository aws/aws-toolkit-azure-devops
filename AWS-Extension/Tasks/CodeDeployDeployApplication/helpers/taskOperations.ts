import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCodeDeployClient = require('aws-sdk/clients/codedeploy');
import awsS3Client = require('aws-sdk/clients/s3');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async deploy(taskParameters: TaskParameters.DeployTaskParameters): Promise<void> {

        this.createServiceClients(taskParameters);

        await this.verifyResourcesExist(taskParameters.applicationName, taskParameters.deploymentGroupName);

        const bundleKey = await this.uploadBundle(taskParameters.revisionBundle, taskParameters.bucketName, taskParameters.bundlePrefix);
        const deploymentId: string = await this.deployRevision(taskParameters, bundleKey);
        await this.waitForDeploymentCompletion(taskParameters.applicationName, deploymentId);

        console.log(tl.loc('TaskCompleted', taskParameters.applicationName));
    }

    private static codeDeployClient: awsCodeDeployClient;
    private static s3Client: awsS3Client;

    private static createServiceClients(taskParameters: TaskParameters.DeployTaskParameters) {

        this.codeDeployClient = new awsCodeDeployClient({
            apiVersion: '2014-10-06',
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

    private static async verifyResourcesExist(appName: string, groupName: string): Promise<void> {

        try {
            await this.codeDeployClient.getApplication({ applicationName: appName }).promise();
        } catch (err) {
            throw new Error(tl.loc('ApplicationDoesNotExist', appName));
        }

        try {
            await this.codeDeployClient.getDeploymentGroup({applicationName: appName, deploymentGroupName: groupName}).promise();
        } catch (err) {
            throw new Error(tl.loc('DeploymentGroupDoesNotExist', groupName, appName));
        }
    }

    private static async uploadBundle(revisionBundle: string, bucketName: string, bundlePrefix: string): Promise<string> {

        let key: string;
        const bundleFilename = path.basename(revisionBundle);
        if (bundlePrefix) {
            key = bundlePrefix + '/' + bundleFilename;
        } else {
            key = bundleFilename;
        }

        console.log(tl.loc('UploadingBundle', revisionBundle, key, bucketName));
        const fileBuffer = fs.createReadStream(revisionBundle);
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

    private static async deployRevision(taskParameters: TaskParameters.DeployTaskParameters, bundleKey: string): Promise<string> {
        console.log(tl.loc('DeployingRevision'));

        let archiveType: string = path.extname(taskParameters.revisionBundle);
        if (archiveType && archiveType.length > 1) {
            // let the service error out if the type is not one they currently support
            archiveType = archiveType.substring(1).toLowerCase();
        } else {
            tl.debug('Unable to determine archive type, assuming zip');
             archiveType = 'zip';
        }

        try {
            const request: awsCodeDeployClient.CreateDeploymentInput = {
                applicationName: taskParameters.applicationName,
                deploymentGroupName: taskParameters.deploymentGroupName,
                description: taskParameters.description,
                fileExistsBehavior: taskParameters.fileExistsBehavior,
                ignoreApplicationStopFailures: taskParameters.ignoreApplicationStopFailures,
                updateOutdatedInstancesOnly: taskParameters.updateOutdatedInstancesOnly,
                revision: {
                    revisionType: 'S3',
                    s3Location: {
                        bucket: taskParameters.bucketName,
                        key: bundleKey,
                        bundleType: archiveType
                    }
                }
            };
            const response: awsCodeDeployClient.CreateDeploymentOutput = await this.codeDeployClient.createDeployment(request).promise();
            console.log(tl.loc('DeploymentStarted', taskParameters.deploymentGroupName, taskParameters.applicationName, response.deploymentId));
            return response.deploymentId;
        } catch (err) {
            console.error(tl.loc('DeploymentError', err.message), err);
            throw err;
        }
    }

    private static async waitForDeploymentCompletion(applicationName: string, deploymentId: string) : Promise<void> {

         return new Promise<void>((resolve, reject) => {
            console.log(tl.loc('WaitingForDeployment'));

            this.codeDeployClient.waitFor('deploymentSuccessful',
                                          { deploymentId },
                                          function(err: AWSError, data: awsCodeDeployClient.GetDeploymentOutput) {
                if (err) {
                    throw new Error(tl.loc('DeploymentFailed', applicationName, err.message));
                } else {
                    console.log(tl.loc('WaitConditionSatisifed'));
                }
            });
         });
    }
}
