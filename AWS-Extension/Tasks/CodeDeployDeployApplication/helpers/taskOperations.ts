import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCodeDeployClient = require('aws-sdk/clients/codedeploy');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async deploy(taskParameters: TaskParameters.DeployTaskParameters): Promise<void> {
        this.constructServiceClients(taskParameters);

        const deploymentId: string = await this.deployRevision(taskParameters);
        await this.waitForDeploymentCompletion(taskParameters.applicationName, deploymentId);

        console.log(tl.loc('TaskCompleted', taskParameters.applicationName));
    }

    private static codeDeployClient: awsCodeDeployClient;

    private static constructServiceClients(taskParameters: TaskParameters.DeployTaskParameters) {
        this.codeDeployClient = new awsCodeDeployClient({
            apiVersion: '2014-10-06',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        });
    }

    private static async deployRevision(taskParameters: TaskParameters.DeployTaskParameters): Promise<string> {

        console.log(tl.loc('DeployingRevision'));

        let archiveType: string = path.extname(taskParameters.deploymentArchive);
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
                        key: taskParameters.deploymentArchive,
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
