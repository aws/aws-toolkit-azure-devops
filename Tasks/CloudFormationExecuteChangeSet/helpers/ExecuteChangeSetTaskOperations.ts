/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import CloudFormation = require('aws-sdk/clients/cloudformation');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './ExecuteChangeSetTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {

        await this.createServiceClients();

        const stackId = await this.verifyResourcesExist(this.taskParameters.changeSetName, this.taskParameters.stackName);
        let waitForStackUpdate: boolean = false;
        if (stackId) {
            waitForStackUpdate = await this.testStackHasResources(this.taskParameters.stackName);
        }

        console.log(tl.loc('ExecutingChangeSet', this.taskParameters.changeSetName, this.taskParameters.stackName));

        try {
            await this.cloudFormationClient.executeChangeSet({
                ChangeSetName: this.taskParameters.changeSetName,
                StackName: this.taskParameters.stackName
            }).promise();

            if (waitForStackUpdate) {
                await this.waitForStackUpdate(this.taskParameters.stackName);
            } else {
                await this.waitForStackCreation(this.taskParameters.stackName);
            }

            if (this.taskParameters.outputVariable) {
                console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable));
                tl.setVariable(this.taskParameters.outputVariable, stackId);
            }

            console.log(tl.loc('TaskCompleted', this.taskParameters.changeSetName));
        } catch (err) {
            console.error(tl.loc('ExecuteChangeSetFailed', err.message), err);
            throw err;
        }
    }

    private cloudFormationClient: CloudFormation;

    private async createServiceClients(): Promise<void> {

        const cfnOpts: CloudFormation.ClientConfiguration = {
            apiVersion: '2010-05-15'
        };
        this.cloudFormationClient = await SdkUtils.createAndConfigureSdkClient(CloudFormation, cfnOpts, this.taskParameters, tl.debug);
    }

    private async verifyResourcesExist(changeSetName: string, stackName: string): Promise<string> {

        try {
            const request: CloudFormation.DescribeChangeSetInput = {
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

    // Stacks 'created' with a change set are not fully realised until the change set
    // executes, so we inspect whether resources exist in order to know which kind
    // of 'waiter' to use (create complete, update complete) when running a stack update.
    // It's not enough to know that the stack exists.
    private async testStackHasResources(stackName: string): Promise<boolean> {
        try {
            const response = await this.cloudFormationClient.describeStackResources({ StackName: stackName }).promise();
            return (response.StackResources && response.StackResources.length > 0);
        } catch (err) {
            return false;
        }
    }

    private async waitForStackCreation(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackCreation', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackCreateComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackCreated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackCreationFailed', stackName, err.message));
        }
    }

    private async waitForStackUpdate(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackUpdate', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackUpdateComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackUpdated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackUpdateFailed', stackName, err.message));
        }
    }

}
