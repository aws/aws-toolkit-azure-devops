/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import SSM = require('aws-sdk/clients/ssm')
import tl = require('vsts-task-lib/task')
import { fromBuildVariable, fromInstanceIds, fromTags, TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly ssmClient: SSM,
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        const request: SSM.SendCommandRequest = {
            DocumentName: this.taskParameters.documentName,
            Comment: this.taskParameters.comment,
            MaxConcurrency: this.taskParameters.maxConcurrency,
            MaxErrors: this.taskParameters.maxErrors,
            ServiceRoleArn: this.taskParameters.serviceRoleARN,
            TimeoutSeconds: parseInt(this.taskParameters.timeout, 10),
            OutputS3BucketName: this.taskParameters.outputS3BucketName,
            OutputS3KeyPrefix: this.taskParameters.outputS3KeyPrefix
        }

        if (this.taskParameters.documentParameters) {
            // tslint:disable-next-line: no-unsafe-any
            request.Parameters = JSON.parse(this.taskParameters.documentParameters)
        }

        switch (this.taskParameters.instanceSelector) {
            case fromInstanceIds:
                request.InstanceIds = this.taskParameters.instanceIds
                break

            case fromTags:
                request.Targets = []
                // TODO repalce with getTags when https://github.com/aws/aws-vsts-tools/pull/184 merges
                this.taskParameters.instanceTags.forEach((it) => {
                    const kv = it.split('=')
                    const t: SSM.Target = {}
                    t.Key = 'tag:' + kv[0].trim()
                    t.Values = kv[1].split(',')
                    request.Targets.push(t)
                })
                break

            case fromBuildVariable:
                const instanceIds = tl.getVariable(this.taskParameters.instanceBuildVariable)
                if (instanceIds) {
                    request.InstanceIds = instanceIds.trim().split(',')
                } else {
                    throw new Error(tl.loc('InstanceIdsFromVariableFailed', this.taskParameters.instanceBuildVariable))
                }
                break
        }

        if (this.taskParameters.notificationArn) {
            request.NotificationConfig = {
                NotificationArn: this.taskParameters.notificationArn,
                NotificationEvents: [ this.taskParameters.notificationEvents ],
                NotificationType: this.taskParameters.notificationType
            }
        }

        const response = await this.ssmClient.sendCommand(request).promise()
        if (this.taskParameters.commandIdOutputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.commandIdOutputVariable))
            tl.setVariable(this.taskParameters.commandIdOutputVariable, response.Command.CommandId)
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.documentName, response.Command.CommandId))
    }
}
