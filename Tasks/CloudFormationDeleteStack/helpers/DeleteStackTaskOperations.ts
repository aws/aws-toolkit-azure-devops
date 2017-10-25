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
import CloudFormation = require('aws-sdk/clients/cloudformation');
import Parameters = require('./DeleteStackTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async deleteStack(taskParameters: Parameters.TaskParameters): Promise<void> {

        await this.createServiceClients(taskParameters);

        await this.verifyResourcesExist(taskParameters.stackName);

        console.log(tl.loc('RequestingStackDeletion', taskParameters.stackName));
        await this.cloudFormationClient.deleteStack({
            StackName: taskParameters.stackName
        }).promise();
        await this.waitForStackDeletion(taskParameters.stackName);

        console.log(tl.loc('TaskCompleted'));
    }

    private static cloudFormationClient: CloudFormation;

    private static async createServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const cfnOpts: CloudFormation.ClientConfiguration = {
            apiVersion: '2010-05-15',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.cloudFormationClient = sdkutils.createAndConfigureSdkClient(CloudFormation, cfnOpts, taskParameters, tl.debug);
    }

    private static async verifyResourcesExist(stackName: string): Promise<void> {

        try {
            await this.cloudFormationClient.describeStacks({ StackName: stackName}).promise();
        } catch (err) {
            throw new Error(tl.loc('StackDoesNotExist', stackName));
        }
    }

    // wait for stack deletetion
    private static async waitForStackDeletion(stackName: string): Promise<void> {
        console.log(tl.loc('WaitingForStackDeletion', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackDeleteComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackDeleted'));
        } catch (err) {
            throw new Error(tl.loc('StackDeletionFailed', stackName, err.message));
        }
    }

}
