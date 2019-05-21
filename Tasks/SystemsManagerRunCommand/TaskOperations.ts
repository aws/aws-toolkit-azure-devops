/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SSM = require('aws-sdk/clients/ssm');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './RunCommandTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        await this.createServiceClients();

        const request: SSM.SendCommandRequest = {
            DocumentName: this.taskParameters.documentName,
            Comment: this.taskParameters.comment,
            MaxConcurrency: this.taskParameters.maxConcurrency,
            MaxErrors: this.taskParameters.maxErrors,
            ServiceRoleArn: this.taskParameters.serviceRoleARN,
            TimeoutSeconds: parseInt(this.taskParameters.timeout, 10),
            OutputS3BucketName: this.taskParameters.outputS3BucketName,
            OutputS3KeyPrefix: this.taskParameters.outputS3KeyPrefix
        };

        if (this.taskParameters.documentParameters) {
            request.Parameters = JSON.parse(this.taskParameters.documentParameters);
        }

        switch (this.taskParameters.instanceSelector) {
            case TaskParameters.fromInstanceIds: {
                request.InstanceIds = this.taskParameters.instanceIds;
            }
            break;

            case TaskParameters.fromTags: {
                request.Targets = [];
                this.taskParameters.instanceTags.forEach((it) => {
                    const kv = it.split('=');
                    const t: SSM.Target = {};
                    t.Key = 'tag:' + kv[0].trim();
                    t.Values = kv[1].split(',');
                    request.Targets.push(t);
                });
            }
            break;

            case TaskParameters.fromBuildVariable: {
                const instanceIds = tl.getVariable(this.taskParameters.instanceBuildVariable);
                if (instanceIds) {
                    request.InstanceIds = instanceIds.trim().split(',');
                } else {
                    throw new Error(tl.loc('InstanceIdsFromVariableFailed', this.taskParameters.instanceBuildVariable));
                }
            }
        }

        if (this.taskParameters.notificationArn) {
            request.NotificationConfig = {
                NotificationArn: this.taskParameters.notificationArn,
                NotificationEvents: [ this.taskParameters.notificationEvents ],
                NotificationType: this.taskParameters.notificationType
            };
        }

        const response = await this.ssmClient.sendCommand(request).promise();
        if (this.taskParameters.commandIdOutputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.commandIdOutputVariable));
            tl.setVariable(this.taskParameters.commandIdOutputVariable, response.Command.CommandId);
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.documentName, response.Command.CommandId));
    }

    private ssmClient: SSM;

    private async createServiceClients(): Promise<void> {

        const ssmOpts: SSM.ClientConfiguration = {
            apiVersion: '2014-11-06'
        };
        this.ssmClient = await SdkUtils.createAndConfigureSdkClient(SSM, ssmOpts, this.taskParameters, tl.debug);
    }
}
