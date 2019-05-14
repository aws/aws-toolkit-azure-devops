/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SNS, SQS } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SendMessage/TaskOperations'
import { TaskParameters } from '../../../Tasks/SendMessage/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    messageTarget: undefined,
    message: undefined,
    topicArn: undefined,
    queueUrl: undefined,
    delaySeconds: undefined
}

const promiseThrowsResponse = {
    promise: function() {
        throw new Error('no')
    }
}

const promiseSuceeds = {
    promise: function() {
        return undefined
    }
}

describe('Send Message', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SendMessage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SNS(), new SQS(), defaultTaskParameters)).not.toBeNull()
    })

    test('Send message to queue when message target is not topic', () => {
        expect.assertions(1)
        const sqs = new SQS() as any
        sqs.getQueueAttributes = jest.fn(() => undefined)
        const taskOperations = new TaskOperations(new SNS(), sqs, defaultTaskParameters)
        taskOperations.execute().catch()
        expect(sqs.getQueueAttributes).toBeCalled()
    })

    test('Send message to queue when message to topic when target is topic', () => {
        expect.assertions(1)
        const taskParams = {...defaultTaskParameters}
        taskParams.messageTarget = 'topic'
        const sns = new SNS() as any
        sns.getTopicAttributes = jest.fn(() => undefined)
        const taskOperations = new TaskOperations(sns, new SQS(), taskParams)
        taskOperations.execute().catch()
        expect(sns.getTopicAttributes).toBeCalled()
    })

    test('Verify topic exists fails, fails task', async () => {
        expect.assertions(2)
        const taskParams = {...defaultTaskParameters}
        taskParams.messageTarget = 'topic'
        const sns = new SNS() as any
        sns.getTopicAttributes = jest.fn(() => promiseThrowsResponse)
        const taskOperations = new TaskOperations(sns, new SQS(), taskParams)
        await taskOperations.execute().catch((e) => expect(e.message).toContain('no'))
        expect(sns.getTopicAttributes).toBeCalled()
    })

    test('Verify queue exists fails, fails task', () => {
        expect.assertions(2)
        const sqs = new SQS() as any
        sqs.getQueueAttributes = jest.fn(() => promiseThrowsResponse)
        const taskOperations = new TaskOperations(new SNS(), sqs, defaultTaskParameters)
        taskOperations.execute().catch((e) => expect(e.message).toContain('no'))
        expect(sqs.getQueueAttributes).toBeCalled()
    })

    test('Send message to topic succeeds', () => {
        const taskOperations = new TaskOperations(new SNS(), new SQS(), defaultTaskParameters)
    })

    test('Send message to queue succeeds', async () => {
        expect.assertions(2)
        const sqs = new SQS() as any
        sqs.getQueueAttributes = jest.fn(() => promiseSuceeds)
        sqs.publish = jest.fn(() => promiseSuceeds)
        const taskOperations = new TaskOperations(new SNS(), sqs, defaultTaskParameters)
        await taskOperations.execute()
        expect(sqs.getQueueAttributes).toBeCalled()
        expect(sqs.publish).toBeCalled()
    })
})
