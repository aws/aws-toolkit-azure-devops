/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import SNS = require('aws-sdk/clients/sns')
import SQS = require('aws-sdk/clients/sqs')
import tl = require('vsts-task-lib/task')
import { TaskParameters } from './TaskParameters'

export class TaskOperations {

    public constructor(
        public readonly snsClient: SNS,
        public readonly sqsClient: SQS,
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        if (this.taskParameters.messageTarget === 'topic') {
            await this.verifyTopicExists(this.taskParameters.topicArn)
            await this.sendMessageToTopic()
        } else {
            await this.verifyQueueExists(this.taskParameters.queueUrl)
            await this.sendMessageToQueue()
        }

        console.log(tl.loc('TaskCompleted'))
    }

    private async verifyTopicExists(topicArn: string): Promise<void> {
        try {
            await this.snsClient.getTopicAttributes({TopicArn: topicArn}).promise()
        } catch (err) {
            throw new Error(tl.loc('TopicDoesNotExist', topicArn))
        }
    }

    private async verifyQueueExists(queueUrl: string): Promise<void> {
        try {
            await this.sqsClient.getQueueAttributes({QueueUrl: queueUrl, AttributeNames: ['QueueArn']}).promise()
        } catch (err) {
            throw new Error(tl.loc('QueueDoesNotExist', queueUrl))
        }
    }

    private async sendMessageToTopic(): Promise<void> {
        console.log(tl.loc('SendingToTopic', this.taskParameters.topicArn))

        try {
            await this.snsClient.publish({
                TopicArn: this.taskParameters.topicArn,
                Message: this.taskParameters.message
            }).promise()
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            throw new Error(tl.loc('SendError', err.message))
        }
    }

    private async sendMessageToQueue(): Promise<void> {
        try {
            const request: SQS.SendMessageRequest = {
                QueueUrl: this.taskParameters.queueUrl,
                MessageBody: this.taskParameters.message
            }
            if (this.taskParameters.delaySeconds) {
                request.DelaySeconds = this.taskParameters.delaySeconds
                console.log(tl.loc('SendingToQueueWithDelay',
                                   this.taskParameters.delaySeconds,
                                   this.taskParameters.queueUrl))
            } else {
                console.log(tl.loc('SendingToQueue', this.taskParameters.queueUrl))
            }
            await this.sqsClient.sendMessage(request).promise()
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            throw new Error(tl.loc('SendError', err.message))
        }
    }
}
