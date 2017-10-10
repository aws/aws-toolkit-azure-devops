/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SQS = require('aws-sdk/clients/sqs');
import SNS = require('aws-sdk/clients/sns');
import Parameters = require('./SendMessageTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async sendMessage(taskParameters: Parameters.TaskParameters): Promise<void> {
        this.createServiceClients(taskParameters);

        if (taskParameters.messageTarget === 'topic') {
            await this.verifyTopicExists(taskParameters.topicArn);
            await this.sendMessageToTopic(taskParameters);
        } else {
            await this.verifyQueueExists(taskParameters.queueUrl);
            await this.sendMessageToQueue(taskParameters);
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private static sqsClient : SQS;
    private static snsClient : SNS;

    private static createServiceClients(taskParameters: Parameters.TaskParameters) {

       const sqsOpts: SQS.ClientConfiguration = {
            apiVersion: '2012-11-05',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
       };
       this.sqsClient = sdkutils.createAndConfigureSdkClient(SQS, sqsOpts, taskParameters, tl.debug);

       const snsOpts: SNS.ClientConfiguration = {
            apiVersion: '2010-03-31',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
       };
       this.snsClient = sdkutils.createAndConfigureSdkClient(SNS, snsOpts, taskParameters, tl.debug);
    }

    private static async verifyTopicExists(topicArn: string): Promise<void> {
        try {
            await this.snsClient.getTopicAttributes({TopicArn: topicArn}).promise();
        } catch (err) {
            throw new Error(tl.loc('TopicDoesNotExist', topicArn));
        }
    }

    private static async verifyQueueExists(queueUrl: string): Promise<void> {
        try {
            await this.sqsClient.getQueueAttributes({QueueUrl: queueUrl, AttributeNames: ['QueueArn']}).promise();
        } catch (err) {
            throw new Error(tl.loc('QueueDoesNotExist', queueUrl));
        }
    }

    private static async sendMessageToTopic(taskParameters: Parameters.TaskParameters): Promise<void> {
        console.log(tl.loc('SendingToTopic', taskParameters.topicArn));

        try {
            await this.snsClient.publish({
                TopicArn: taskParameters.topicArn,
                Message: taskParameters.message
            }).promise();
        } catch (err) {
            throw new Error(tl.loc('SendError', err.message));
        }
    }

    private static async sendMessageToQueue(taskParameters: Parameters.TaskParameters): Promise<void> {
        try {
            const request: SQS.SendMessageRequest = {
                QueueUrl: taskParameters.queueUrl,
                MessageBody: taskParameters.message
            };
            if (taskParameters.delaySeconds) {
                request.DelaySeconds = taskParameters.delaySeconds;
                console.log(tl.loc('SendingToQueueWithDelay', taskParameters.delaySeconds, taskParameters.queueUrl));
            } else {
                console.log(tl.loc('SendingToQueue', taskParameters.queueUrl));
            }
            await this.sqsClient.sendMessage(request).promise();
        } catch (err) {
            throw new Error(tl.loc('SendError', err.message));
        }
    }

}
