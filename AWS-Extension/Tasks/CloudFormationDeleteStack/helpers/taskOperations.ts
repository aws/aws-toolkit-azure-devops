import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async deleteStack(taskParameters: TaskParameters.DeleteStackTaskParameters): Promise<void> {

        console.log(tl.loc('RequestingStackDeletetion', taskParameters.stackName));
        this.createServiceClients(taskParameters);

        await this.cloudFormationClient.deleteStack({
            StackName: taskParameters.stackName
        }).promise();
        await this.waitForStackDeletion(taskParameters.stackName);

        console.log(tl.loc('TaskCompleted'));
    }

    private static cloudFormationClient: awsCloudFormation;

    private static createServiceClients(taskParameters: TaskParameters.DeleteStackTaskParameters) {
        this.cloudFormationClient = new awsCloudFormation({
            apiVersion: '2010-05-15',
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            region: taskParameters.awsRegion
        });
    }

    // wait for stack deletetion
    private static waitForStackDeletion(stackName: string) : Promise<void> {

        return new Promise<void>((resolve, reject) => {
            this.cloudFormationClient.waitFor('stackDeleteComplete',
                                              { StackName: stackName },
                                              function(err: AWSError, data: awsCloudFormation.DescribeStacksOutput) {
                if (err) {
                    throw new Error(tl.loc('StackDeletionFailed', stackName, err.message));
                }
            });
        });
    }

}
