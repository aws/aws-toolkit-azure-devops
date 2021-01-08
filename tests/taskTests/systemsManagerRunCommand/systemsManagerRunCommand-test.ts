/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SSM } from 'aws-sdk'
import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/SystemsManagerRunCommand/TaskOperations'
import {
    fromBuildVariable,
    fromInstanceIds,
    fromTags,
    TaskParameters
} from 'tasks/SystemsManagerRunCommand/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    documentName: '',
    documentParameters: '',
    serviceRoleARN: '',
    comment: '',
    instanceSelector: '',
    instanceIds: [],
    instanceTags: [],
    instanceBuildVariable: '',
    maxConcurrency: '',
    maxErrors: '',
    timeout: '',
    notificationArn: '',
    notificationEvents: '',
    notificationType: '',
    outputS3BucketName: '',
    outputS3KeyPrefix: '',
    commandIdOutputVariable: ''
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
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/SystemsManagerRunCommand/task.json')
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

    test('Instance from instance ids', async () => {
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
        try {
            await taskOperations.execute()
        } catch (e) {}
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

    test('Instance from tags', async () => {
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
        try {
            await taskOperations.execute()
        } catch (e) {}
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })

    test('Adds notification arn if it exists', async () => {
        expect.assertions(2)
        const ssm = new SSM() as any
        ssm.sendCommand = jest.fn(args => {
            expect(args.NotificationConfig.NotificationArn).toBe('arn')

            return systemsManagerFails
        })
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.notificationArn = 'arn'
        const taskOperations = new TaskOperations(ssm, taskParameters)
        try {
            await taskOperations.execute()
        } catch (e) {}
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })

    test('Happy path', async () => {
        expect.assertions(1)
        const ssm = new SSM() as any
        ssm.sendCommand = jest.fn(() => {
            return systemsManagerSucceeds
        })
        const taskOperations = new TaskOperations(ssm, defaultTaskParameters)
        await taskOperations.execute()
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })
})
