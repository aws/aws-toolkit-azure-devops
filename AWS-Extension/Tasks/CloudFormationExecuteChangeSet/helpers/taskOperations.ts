import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async executeChangeSet(taskParameters: TaskParameters.ExecuteChangeSetTaskParameters): Promise<void> {

        this.createServiceClients(taskParameters);

        const stackId = await this.verifyResourcesExist(taskParameters.changeSetName, taskParameters.stackName);
        let needCreateWaiter: boolean = true;
        if (stackId) {
            // we need to know whether to queue a create or an update waiter when we exec the change set
            try {
                const response = await this.cloudFormationClient.describeStackResources({ StackName: stackId }).promise();
                if (response.StackResources && response.StackResources.length > 0) {
                    console.log(tl.loc('SelectingUpdateWaiter'));
                    needCreateWaiter = false;
                }

            } catch (err) {
                throw new Error(tl.loc('FailedToObtainStackStatus', err.message));
            }
        }

        console.log(tl.loc('ExecutingChangeSet', taskParameters.changeSetName, taskParameters.stackName));

        try {
            await this.cloudFormationClient.executeChangeSet({
                ChangeSetName: taskParameters.changeSetName,
                StackName: taskParameters.stackName
            }).promise();

            if (needCreateWaiter) {
                await this.waitForStackCreation(taskParameters.stackName);
            } else {
                await this.waitForStackUpdate(taskParameters.stackName);
            }

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

    private static async verifyResourcesExist(changeSetName: string, stackName: string): Promise<string> {

        try {
            const request: awsCloudFormation.DescribeChangeSetInput = {
                ChangeSetName: changeSetName
            };
            if (stackName) {
                request.StackName = stackName;
            }

            const response = await this.cloudFormationClient.describeChangeSet(request).promise();
            return response.StackId;
        } catch (err) {
            throw new Error(tl.loc('ChangeSetDoesNotExist', changeSetName));
        }
    }

    private static async waitForStackCreation(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackCreation', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackCreateComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackCreated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackCreationFailed', stackName, err.message));
        }
    }

    private static async waitForStackUpdate(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackUpdate', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackUpdateComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackUpdated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackUpdateFailed', stackName, err.message));
        }
    }

}
