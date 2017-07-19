import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async executeChangeSet(taskParameters: TaskParameters.ExecuteChangeSetTaskParameters): Promise<void> {

        this.createServiceClients(taskParameters);

        await this.verifyResourcesExist(taskParameters.changeSetName, taskParameters.stackName);

        console.log(tl.loc('ExecutingChangeSet', taskParameters.changeSetName, taskParameters.stackName));

        try {
            await this.cloudFormationClient.executeChangeSet({
                ChangeSetName: taskParameters.changeSetName,
                StackName: taskParameters.stackName
            }).promise();

            const stackId = await this.waitForStackCreation(taskParameters.stackName);

            if (taskParameters.outputVariable) {
                console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable));
                tl.setVariable(taskParameters.outputVariable, stackId);
            }

            console.log(tl.loc('TaskCompleted', taskParameters.changeSetName));
        } catch (err) {
            console.error(tl.loc('ExecuteChangeSetFailed', err.message), err);
            throw err;
        }
    }

    private static cloudFormationClient: awsCloudFormation;

    private static createServiceClients(taskParameters: TaskParameters.ExecuteChangeSetTaskParameters) {

        this.cloudFormationClient = new awsCloudFormation({
            apiVersion: '2010-05-15',
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            region: taskParameters.awsRegion
        });
    }

    private static async verifyResourcesExist(changeSetName: string, stackName: string): Promise<void> {

        try {
            const request: awsCloudFormation.DescribeChangeSetInput = {
                ChangeSetName: changeSetName
            };
            if (stackName) {
                request.StackName = stackName;
            }

            await this.cloudFormationClient.describeChangeSet(request).promise();
        } catch (err) {
            throw new Error(tl.loc('ChangeSetDoesNotExist', changeSetName));
        }
    }

    private static async waitForStackCreation(stackName: string) : Promise<string> {

        return new Promise<string>((resolve, reject) => {
            console.log(tl.loc('WaitingForStack', stackName));

            this.cloudFormationClient.waitFor('stackCreateComplete',
                                              { StackName: stackName },
                                              function(err: AWSError, data: awsCloudFormation.DescribeStacksOutput) {
                if (err) {
                    throw new Error(tl.loc('StackCreationFailed', stackName, err.message));
                } else {
                    console.log(tl.loc('WaitConditionSatisifed'));
                    return data.Stacks[0].StackId;
                }
            });
        });
    }

}
