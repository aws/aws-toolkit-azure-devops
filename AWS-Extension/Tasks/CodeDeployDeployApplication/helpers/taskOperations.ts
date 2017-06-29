import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCodeDeployClient = require('aws-sdk/clients/codedeploy');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async deploy(taskParameters: TaskParameters.DeployTaskParameters): Promise<void> {
        this.constructServiceClient(taskParameters);

        // await this.registerRevision(taskParameters);
        await this.deployRevision(taskParameters);
    }

    private static codeDeployClient: awsCodeDeployClient;

    private static constructServiceClient(taskParameters: TaskParameters.DeployTaskParameters) {
        this.codeDeployClient = new awsCodeDeployClient({
            apiVersion: '2014-10-06',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        });
    }

    private static async registerRevision(taskParameters: TaskParameters.DeployTaskParameters): Promise<void> {
        console.log('Registering new revision with CodeDeploy');

        let archiveType: string = path.extname(taskParameters.deploymentArchive);
        if (archiveType && archiveType.length > 1) {
            // let the service error out if the type is not one they currently support
            archiveType = archiveType.substring(1).toLowerCase();
        } else {
             archiveType = 'zip'; // make an assumption
        }

        try {
            const request: awsCodeDeployClient.RegisterApplicationRevisionInput = {
                applicationName: taskParameters.applicationName,
                description: taskParameters.description,
                revision: {
                    revisionType: 'S3',
                    s3Location: {
                        bucket: taskParameters.bucketName,
                        key: taskParameters.deploymentArchive,
                        bundleType: archiveType
                    }
                }
            };
            await this.codeDeployClient.registerApplicationRevision(request).promise();
        } catch (err) {
            console.error('Error registering new revision', err);
            throw err;
        }
    }

    private static async deployRevision(taskParameters: TaskParameters.DeployTaskParameters): Promise<void> {
        console.log(tl.loc('DeployingRevision'));

        let archiveType: string = path.extname(taskParameters.deploymentArchive);
        if (archiveType && archiveType.length > 1) {
            // let the service error out if the type is not one they currently support
            archiveType = archiveType.substring(1).toLowerCase();
        } else {
             archiveType = 'zip'; // make an assumption
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
                        key: taskParameters.deploymentArchive,
                        bundleType: archiveType
                    }
                }
            };
            const response: awsCodeDeployClient.CreateDeploymentOutput = await this.codeDeployClient.createDeployment(request).promise();
            console.log(tl.loc('RevisionDeployed', taskParameters.deploymentGroupName, taskParameters.applicationName));
        } catch (err) {
            console.error(tl.loc('RevisionDeploymentFailed'), err);
            throw err;
        }
    }

}
