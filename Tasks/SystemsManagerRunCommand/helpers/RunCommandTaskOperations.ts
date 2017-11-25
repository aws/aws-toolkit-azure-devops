/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SSM = require('aws-sdk/clients/ssm');
import Parameters = require('./RunCommandTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async runCommand(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.createServiceClients(taskParameters);

        const request: SSM.SendCommandRequest = {
            DocumentName: taskParameters.documentName,
            Comment: taskParameters.comment,
            MaxConcurrency: taskParameters.maxConcurrency,
            MaxErrors: taskParameters.maxErrors,
            ServiceRoleArn: taskParameters.serviceRoleARN,
            TimeoutSeconds: parseInt(taskParameters.timeout, 10),
            OutputS3BucketName: taskParameters.outputS3BucketName,
            OutputS3KeyPrefix: taskParameters.outputS3KeyPrefix
        };

        if (taskParameters.documentParameters) {
            request.Parameters = JSON.parse(taskParameters.documentParameters);
        }

        switch (taskParameters.instanceSelector) {
            case taskParameters.fromInstanceIds: {
                request.InstanceIds = taskParameters.instanceIds;
            }
            break;

            case taskParameters.fromTags: {
                request.Targets = [];
                taskParameters.instanceTags.forEach((it) => {
                const kv = it.split('=');
                const t: SSM.Target = {};
                t.Key = 'tag:' + kv[0].trim();
                t.Values = kv[1].split(',');
                request.Targets.push(t);
           });
            }
            break;

            case taskParameters.fromBuildVariable: {
                const instanceIds = tl.getVariable(taskParameters.instanceBuildVariable);
                if (instanceIds) {
                    request.InstanceIds = instanceIds.trim().split(',');
                } else {
                    throw new Error(tl.loc('InstanceIdsFromVariableFailed', taskParameters.instanceBuildVariable));
                }
            }
        }

        if (taskParameters.notificationArn) {
            request.NotificationConfig = {
                NotificationArn: taskParameters.notificationArn,
                NotificationEvents: [ taskParameters.notificationEvents ],
                NotificationType: taskParameters.notificationType
            };
        }

        const response = await this.ssmClient.sendCommand(request).promise();
        if (taskParameters.commandIdOutputVariable) {
            console.log(tl.loc('SettingOutputVariable', taskParameters.commandIdOutputVariable));
            tl.setVariable(taskParameters.commandIdOutputVariable, response.Command.CommandId);
        }

        console.log(tl.loc('TaskCompleted', taskParameters.documentName, response.Command.CommandId));
    }

    private static ssmClient: SSM;

    private static async createServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const ssmOpts: SSM.ClientConfiguration = {
            apiVersion: '2014-11-06',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.ssmClient = sdkutils.createAndConfigureSdkClient(SSM, ssmOpts, taskParameters, tl.debug);
    }
}
