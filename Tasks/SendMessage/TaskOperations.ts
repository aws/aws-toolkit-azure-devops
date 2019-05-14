/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SQS = require('aws-sdk/clients/sqs');
import SNS = require('aws-sdk/clients/sns');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './SendMessageTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters,
        public readonly snsClient : SNS,
        public readonly sqsClient : SQS
    ) {
    }

    public async execute(): Promise<void> {
        if (this.taskParameters.messageTarget === 'topic') {
            await this.verifyTopicExists(this.taskParameters.topicArn);
            await this.sendMessageToTopic();
        } else {
            await this.verifyQueueExists(this.taskParameters.queueUrl);
            await this.sendMessageToQueue();
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private async verifyTopicExists(topicArn: string): Promise<void> {
        try {
            await this.snsClient.getTopicAttributes({TopicArn: topicArn}).promise();
        } catch (err) {
            throw new Error(tl.loc('TopicDoesNotExist', topicArn));
        }
    }

    private async verifyQueueExists(queueUrl: string): Promise<void> {
        try {
            await this.sqsClient.getQueueAttributes({QueueUrl: queueUrl, AttributeNames: ['QueueArn']}).promise();
        } catch (err) {
            throw new Error(tl.loc('QueueDoesNotExist', queueUrl));
        }
    }

    private async sendMessageToTopic(): Promise<void> {
        console.log(tl.loc('SendingToTopic', this.taskParameters.topicArn));

        try {
            await this.snsClient.publish({
                TopicArn: this.taskParameters.topicArn,
                Message: this.taskParameters.message
            }).promise();
        } catch (err) {
            throw new Error(tl.loc('SendError', err.message));
        }
    }

    private async sendMessageToQueue(): Promise<void> {
        try {
            const request: SQS.SendMessageRequest = {
                QueueUrl: this.taskParameters.queueUrl,
                MessageBody: this.taskParameters.message
            };
            if (this.taskParameters.delaySeconds) {
                request.DelaySeconds = this.taskParameters.delaySeconds;
                console.log(tl.loc('SendingToQueueWithDelay', this.taskParameters.delaySeconds, this.taskParameters.queueUrl));
            } else {
                console.log(tl.loc('SendingToQueue', this.taskParameters.queueUrl));
            }
            await this.sqsClient.sendMessage(request).promise();
        } catch (err) {
            throw new Error(tl.loc('SendError', err.message));
        }
    }
}
