import tl = require('vsts-task-lib/task');
import path = require('path');
import awsSqsClient = require('aws-sdk/clients/sqs');
import awsSnsClient = require('aws-sdk/clients/sns');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async sendMessage(taskParameters: TaskParameters.SendMessageTaskParameters): Promise<void> {
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

    private static sqsClient: awsSqsClient;
    private static snsClient: awsSnsClient;

    private static createServiceClients(taskParameters: TaskParameters.SendMessageTaskParameters) {

       this.sqsClient = new awsSqsClient({
            apiVersion: '2012-11-05',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
       });

       this.snsClient = new awsSnsClient({
            apiVersion: '2010-03-31',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
       });
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

    private static async sendMessageToTopic(taskParameters: TaskParameters.SendMessageTaskParameters): Promise<void> {
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

    private static async sendMessageToQueue(taskParameters: TaskParameters.SendMessageTaskParameters): Promise<void> {
        try {
            const request: awsSqsClient.SendMessageRequest = {
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
