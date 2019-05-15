/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SSM } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SystemsManagerRunCommand/TaskOperations'
import { fromInstanceIds, TaskParameters } from '../../../Tasks/SystemsManagerRunCommand/TaskParameters'

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
    promise: function() { throw new Error('Failed to do anything') }
}

describe('Systems Manager Run Command', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SecretsManagerGetSecret/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SSM(), defaultTaskParameters)).not.toBeNull()
    })

    test('Invalid document paramaters fails', () => {
        expect.assertions(1)
        const ssm = new SSM() as any
        const taskParameters = {...defaultTaskParameters}
        taskParameters.documentParameters = '{"key":'
        const taskOperations = new TaskOperations(ssm, taskParameters)
        taskOperations.execute().catch((e) => expect(`${e}`).toContain('SyntaxError') )
    })

    test('Instance from instance ids', () => {
        expect.assertions(2)
        const ssm = new SSM() as any
        ssm.sendCommand = jest.fn((args) => {
            expect(args.InstanceIds).toBe(['watermelon'])

            return systemsManagerFails
        })
        const taskParameters = {...defaultTaskParameters}
        taskParameters.instanceSelector = fromInstanceIds
        taskParameters.instanceIds = ['watermelon']
        const taskOperations = new TaskOperations(ssm, taskParameters)
        taskOperations.execute().catch()
        expect(ssm.sendCommand).toBeCalledTimes(1)
    })

    test('Instance from build variable', () => {
        return undefined
    })

    test('Instance from tags', () => {
        return undefined
    })

    test('Adds notification arn if it exists', () => {
        return undefined
    })

    test('Fails on bad response', () => {
        return undefined
    })

    test('Happy path', () => {
        return undefined
    })
})
