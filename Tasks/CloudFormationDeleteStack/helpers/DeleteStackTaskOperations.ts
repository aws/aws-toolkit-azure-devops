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
import { TaskParameters } from './DeleteStackTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }
    public async execute(): Promise<void> {

        await this.createServiceClients();

        await this.verifyResourcesExist(this.taskParameters.stackName);

        console.log(tl.loc('RequestingStackDeletion', this.taskParameters.stackName));
        await this.cloudFormationClient.deleteStack({
            StackName: this.taskParameters.stackName
        }).promise();
        await this.waitForStackDeletion(this.taskParameters.stackName);

        console.log(tl.loc('TaskCompleted'));
    }

    private cloudFormationClient: CloudFormation;

    private async createServiceClients(): Promise<void> {

        const cfnOpts: CloudFormation.ClientConfiguration = {
            apiVersion: '2010-05-15'
        };
        this.cloudFormationClient = await SdkUtils.createAndConfigureSdkClient(CloudFormation, cfnOpts, this.taskParameters, tl.debug);
    }

    private async verifyResourcesExist(stackName: string): Promise<void> {

        try {
            await this.cloudFormationClient.describeStacks({ StackName: stackName}).promise();
        } catch (err) {
            throw new Error(tl.loc('StackDoesNotExist', stackName));
        }
    }

    // wait for stack deletetion
    private async waitForStackDeletion(stackName: string): Promise<void> {
        console.log(tl.loc('WaitingForStackDeletion', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackDeleteComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackDeleted'));
        } catch (err) {
            throw new Error(tl.loc('StackDeletionFailed', stackName, err.message));
        }
    }

}
