/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { IAM, Lambda } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaDeployFunction/TaskOperations'
import { deployCodeAndConfig, deployCodeOnly, TaskParameters } from '../../../Tasks/LambdaDeployFunction/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    deploymentMode: '',
    functionName: 'undefined1',
    functionHandler: '',
    runtime: '',
    codeLocation: '',
    localZipFile: '',
    s3Bucket: '',
    s3ObjectKey: '',
    s3ObjectVersion: undefined,
    roleARN: '',
    description: '',
    layers: [],
    memorySize: 128,
    timeout: 3,
    publish: false,
    deadLetterARN: '',
    kmsKeyARN: '',
    environment: [],
    tags: [],
    securityGroups: [],
    subnets: [],
    tracingConfig: '',
    outputVariable: ''
}

const getFunctionSucceeds = {
    promise: function() {}
}

const getFunctionFails = {
    promise: function() {
        throw new Error('does not exist')
    }
}

const updateFunctionFails = {
    promise: function() {
        throw new Error('update failed')
    }
}

const updateFunctionSucceeds = {
    promise: function() {
        return {
            FunctionArn: 'arn:yes'
        }
    }
}

const getIamRoleSucceeds = {
    promise: function() {
        return {
            Role: {
                Arn: 'arn:yes'
            }
        }
    }
}

describe('Lambda Deploy Function', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/LambdaDeployFunction/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new IAM(), new Lambda(), baseTaskParameters)).not.toBeNull()
    })

    test('Unknown deployment mode fails', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = 'to the moon'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Unrecognized deployment mode to the moon'))
        expect(lambda.getFunction).toBeCalledTimes(1)
    })

    test('Fails to update fails', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        lambda.updateFunctionCode = jest.fn(() => updateFunctionFails)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Error while updating function code'))
        expect(lambda.getFunction).toBeCalledTimes(1)
        expect(lambda.updateFunctionCode).toBeCalledTimes(1)
    })

    test('Deploy only Function does not exist fails', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionFails)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Function undefined1 does not exist'))
        expect(lambda.getFunction).toBeCalledTimes(1)
    })

    test('Deploy only Function exists calls update', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        lambda.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute()
        expect(lambda.getFunction).toBeCalledTimes(1)
        expect(lambda.updateFunctionCode).toBeCalledTimes(1)
    })

    test('Deploy and config does not exist calls create', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionFails)
        lambda.createFunction = jest.fn(() => updateFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute()
        expect(lambda.getFunction).toBeCalledTimes(1)
        expect(lambda.createFunction).toBeCalledTimes(1)
    })

    test('Deploy and config exists calls update', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        lambda.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        lambda.updateFunctionConfiguration = jest.fn(() => updateFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute()
        expect(lambda.getFunction).toBeCalledTimes(1)
        expect(lambda.updateFunctionCode).toBeCalledTimes(1)
        expect(lambda.updateFunctionConfiguration).toBeCalledTimes(1)
    })

    test('Create function adds fields if they exist', async () => {
        expect.assertions(5)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        taskParameters.tracingConfig = 'XRay'
        taskParameters.securityGroups = ['security']
        taskParameters.tags = ['tag1=2', 'tag2=22']
        taskParameters.environment = ['tag1=2', 'tag2=1']
        taskParameters.layers = ['arn:thing:whatever:version']
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionFails)
        lambda.createFunction = jest.fn((args: any) => {
            expect(args.Environment.Variables).toStrictEqual({ tag1: '2', tag2: '1' })
            expect(args.Tags).toStrictEqual({ tag1: '2', tag2: '22' })
            expect(args.VpcConfig.SecurityGroupIds).toStrictEqual(['security'])
            expect(args.TracingConfig).toBeUndefined()
            expect(args.Layers.length).toBe(1)

            return updateFunctionSucceeds
        })
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute()
    })

    test('Update function adds fields if they exist', async () => {
        expect.assertions(4)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        taskParameters.securityGroups = ['security']
        taskParameters.environment = ['tag1=2', 'tag2=1']
        taskParameters.tags = ['tag1=5', 'tag=abc']
        taskParameters.tracingConfig = 'XRay'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        lambda.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        lambda.updateFunctionConfiguration = jest.fn(args => {
            expect(args.Environment.Variables).toStrictEqual({ tag1: '2', tag2: '1' })
            expect(args.VpcConfig.SecurityGroupIds).toStrictEqual(['security'])
            expect(args.TracingConfig).toBeUndefined()

            return updateFunctionSucceeds
        })
        lambda.tagResource = jest.fn(args => {
            expect(args.Tags).toStrictEqual({ tag1: '5', tag: 'abc' })

            return updateFunctionSucceeds
        })
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute()
    })

    test('Update function does not call functions when it should not', async () => {
        expect.assertions(1)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'arn:yes'
        taskParameters.tags = []
        taskParameters.tracingConfig = 'XRay'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        lambda.updateFunctionCode = jest.fn(() => updateFunctionSucceeds)
        lambda.updateFunctionConfiguration = jest.fn(() => updateFunctionSucceeds)
        const tagResourceFunction = jest.fn()
        lambda.tagResource = tagResourceFunction
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations.execute()
        expect(tagResourceFunction).toHaveBeenCalledTimes(0)
    })

    test('IAM call when no role arn specified works', async () => {
        expect.assertions(1)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.deploymentMode = deployCodeAndConfig
        taskParameters.roleARN = 'name'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionFails)
        const iam = new IAM() as any
        iam.getRole = jest.fn(() => getIamRoleSucceeds)
        const taskOperations = new TaskOperations(iam, lambda, taskParameters)
        await taskOperations.execute().catch(e => undefined)
        expect(iam.getRole).toBeCalledTimes(1)
    })
})
