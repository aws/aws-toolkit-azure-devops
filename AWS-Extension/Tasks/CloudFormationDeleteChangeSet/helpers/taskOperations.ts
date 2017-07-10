import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async deleteChangeSet(taskParameters: TaskParameters.DeleteChangeSetTaskParameters): Promise<void> {
        this.createServiceClients(taskParameters);

        console.log(tl.loc('DeletingChangeSet', taskParameters.changeSetName, taskParameters.stackName));

        try {
            await this.cloudFormationClient.deleteChangeSet({
                ChangeSetName: taskParameters.changeSetName,
                StackName: taskParameters.stackName
            }).promise();
            console.log(tl.loc('TaskCompleted', taskParameters.changeSetName));
        } catch (err) {
            console.error(tl.loc('DeleteChangeSetFailed', err.message), err);
            throw err;
        }
    }

    private static cloudFormationClient: awsCloudFormation;

    private static createServiceClients(taskParameters: TaskParameters.DeleteChangeSetTaskParameters) {
        this.cloudFormationClient = new awsCloudFormation({
            apiVersion: '2010-05-15',
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            region: taskParameters.awsRegion
        });
    }
}
