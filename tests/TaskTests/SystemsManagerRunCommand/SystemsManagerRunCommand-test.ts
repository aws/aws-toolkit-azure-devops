/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SSM } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SystemsManagerRunCommand/TaskOperations'
import {
    fromBuildVariable,
    fromInstanceIds,
    fromTags,
    TaskParameters
} from '../../../Tasks/SystemsManagerRunCommand/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    documentName: undefined,
    documentParameters: undefined,
    serviceRoleARN: undefined,
    comment: undefined,
    instanceSelector: undefined,
    instanceIds: undefined,
    instanceTags: undefined,
    instanceBuildVariable: undefined,
    maxConcurrency: undefined,
    maxErrors: undefined,
    timeout: undefined,
    notificationArn: undefined,
    notificationEvents: undefined,
    notificationType: undefined,
    outputS3BucketName: undefined,
    outputS3KeyPrefix: undefined,
    commandIdOutputVariable: undefined
}

const systemsManagerFails = {
    promise: function() {
        throw new Error('Failed to do anything')
    }
}

const systemsManagerSucceeds = {
    promise: function() {
        return { Command: { CommandId: 2 } }
    }
}

describe('Systems Manager Run Command', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SystemsManagerRunCommand/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SSM(), defaultTaskParameters)).not.toBeNull()
    })

    test('Invalid document paramaters fails', () => {
        expect.assertions(1)
        const ssm = new SSM() as any
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.documentParameters = '{"key":'
        const taskOperations = new TaskOperations(ssm, taskParameters)
        taskOperations.execute().catch(e => expect(`${e}`).toContain('SyntaxError'))
    })

    test('Instance from instance ids', () => {
        expect.assertions(2)
        const ssm = new SSM() as any
        ssm.sendCommand = jest.fn(args => {
            expect(args.InstanceIds).toStrictEqual(['watermelon'])

            return systemsManagerFails
        })
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.instanceSelector = fromInstanceIds
        taskParameters.instanceIds = ['watermelon']
        const taskOperations = new TaskOperations(ssm, taskParameters)
        taskOperations.execute().catch()
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })

    test('Instance from build variable', () => {
        expect.assertions(1)
        const ssm = new SSM() as any
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.instanceSelector = fromBuildVariable
        // Agent ID should always fail, which is fine, we just want to check that it reads from there
        taskParameters.instanceBuildVariable = 'Agent.Id'
        const taskOperations = new TaskOperations(ssm, taskParameters)
        taskOperations.execute().catch(e => expect(`${e}`).toContain('Failed to retrieve'))
    })

    test('Instance from tags', () => {
        expect.assertions(2)
        const ssm = new SSM() as any
        ssm.sendCommand = jest.fn(args => {
            expect(args.Targets[0]).toStrictEqual({ Key: 'tag:watermelon', Values: ['fruit', 'green'] })

            return systemsManagerFails
        })
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.instanceSelector = fromTags
        taskParameters.instanceTags = ['watermelon=fruit,green']
        const taskOperations = new TaskOperations(ssm, taskParameters)
        taskOperations.execute().catch()
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })

    test('Adds notification arn if it exists', () => {
        expect.assertions(2)
        const ssm = new SSM() as any
        ssm.sendCommand = jest.fn(args => {
            expect(args.NotificationConfig.NotificationArn).toBe('arn')

            return systemsManagerFails
        })
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.notificationArn = 'arn'
        const taskOperations = new TaskOperations(ssm, taskParameters)
        taskOperations.execute().catch()
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })

    test('Happy path', async () => {
        expect.assertions(1)
        const ssm = new SSM() as any
        ssm.sendCommand = jest.fn(args => {
            return systemsManagerSucceeds
        })
        const taskOperations = new TaskOperations(ssm, defaultTaskParameters)
        await taskOperations.execute()
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })
})
