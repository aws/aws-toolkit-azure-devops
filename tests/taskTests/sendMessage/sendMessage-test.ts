/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SNS, SQS } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SendMessage/TaskOperations'
import { TaskParameters } from '../../../Tasks/SendMessage/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    messageTarget: '',
    message: '',
    topicArn: '',
    queueUrl: '',
    delaySeconds: undefined
}

const promiseThrowsResponse = {
    promise: function() {
        throw new Error('no')
    }
}

const promiseSucceeds = {
    promise: function() {
        return undefined
    }
}

describe('Send Message', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/SendMessage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SNS(), new SQS(), defaultTaskParameters)).not.toBeNull()
    })

    test('Send message to sqs when message target is not topic', async () => {
        expect.assertions(1)
        const sqs = new SQS() as any
        sqs.getQueueAttributes = jest.fn(() => undefined)
        const taskOperations = new TaskOperations(new SNS(), sqs, defaultTaskParameters)
        try {
            await taskOperations.execute()
        } catch (e) {}
        expect(sqs.getQueueAttributes).toBeCalled()
    })

    test('Send message to sns when message target is topic', async () => {
        expect.assertions(1)
        const taskParams = { ...defaultTaskParameters }
        taskParams.messageTarget = 'topic'
        const sns = new SNS() as any
        sns.getTopicAttributes = jest.fn(() => undefined)
        const taskOperations = new TaskOperations(sns, new SQS(), taskParams)
        try {
            await taskOperations.execute()
        } catch (e) {}
        expect(sns.getTopicAttributes).toBeCalled()
    })

    test('Verify topic exists fails, fails task', async () => {
        expect.assertions(2)
        const taskParams = { ...defaultTaskParameters }
        taskParams.messageTarget = 'topic'
        const sns = new SNS() as any
        sns.getTopicAttributes = jest.fn(() => promiseThrowsResponse)
        const taskOperations = new TaskOperations(sns, new SQS(), taskParams)
        await taskOperations.execute().catch(e => expect(e.message).toContain('no'))
        expect(sns.getTopicAttributes).toBeCalled()
    })

    test('Verify queue exists fails, fails task', () => {
        expect.assertions(2)
        const sqs = new SQS() as any
        sqs.getQueueAttributes = jest.fn(() => promiseThrowsResponse)
        const taskOperations = new TaskOperations(new SNS(), sqs, defaultTaskParameters)
        taskOperations.execute().catch(e => expect(e.message).toContain('no'))
        expect(sqs.getQueueAttributes).toBeCalled()
    })

    test('Send message to topic succeeds', async () => {
        expect.assertions(2)
        const taskParams = { ...defaultTaskParameters }
        taskParams.messageTarget = 'topic'
        const sns = new SNS() as any
        sns.getTopicAttributes = jest.fn(() => promiseSucceeds)
        sns.publish = jest.fn(() => promiseSucceeds)
        const taskOperations = new TaskOperations(sns, new SQS(), taskParams)
        await taskOperations.execute()
        expect(sns.getTopicAttributes).toBeCalled()
        expect(sns.publish).toBeCalled()
    })

    test('Send message to queue succeeds', async () => {
        expect.assertions(2)
        const sqs = new SQS() as any
        sqs.getQueueAttributes = jest.fn(() => promiseSucceeds)
        sqs.sendMessage = jest.fn(() => promiseSucceeds)
        const taskOperations = new TaskOperations(new SNS(), sqs, defaultTaskParameters)
        await taskOperations.execute()
        expect(sqs.getQueueAttributes).toBeCalled()
        expect(sqs.sendMessage).toBeCalled()
    })
})
