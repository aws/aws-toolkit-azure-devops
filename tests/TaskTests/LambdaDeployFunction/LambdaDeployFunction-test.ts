/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { IAM, Lambda } from 'aws-sdk'
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaDeployFunction/TaskOperations'
import { TaskParameters, deployCodeOnly } from '../../../Tasks/LambdaDeployFunction/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    deploymentMode: undefined,
    functionName: undefined,
    functionHandler: undefined,
    runtime: undefined,
    codeLocation: undefined,
    localZipFile: undefined,
    s3Bucket: undefined,
    s3ObjectKey: undefined,
    s3ObjectVersion: undefined,
    roleARN: undefined,
    description: undefined,
    memorySize: 128,
    timeout: 3,
    publish: undefined,
    deadLetterARN: undefined,
    kmsKeyARN: undefined,
    environment: undefined,
    tags: undefined,
    securityGroups: undefined,
    subnets: undefined,
    tracingConfig: undefined,
    outputVariable: undefined
}

const getFunctionSucceeds = {
    promise: function() { }
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

describe('Lambda Deploy Function', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/LambdaDeployFunction/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new IAM(), new Lambda(), baseTaskParameters)).not.toBeNull()
    })

    test('Unknown deployment mode fails', async () => {
        expect.assertions(2)
        const taskParameters = {...baseTaskParameters}
        taskParameters.deploymentMode = 'to the moon'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations
            .execute()
            .catch((e) => expect(`${e}`)
            .toContain('Unrecognized deployment mode to the moon'))
        expect(lambda.getFunction).toBeCalledTimes(1)
    })

    test('Fails to update fails', async () => {
        expect.assertions(3)
        const taskParameters = {...baseTaskParameters}
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionSucceeds)
        lambda.updateFunctionCode = jest.fn(() => updateFunctionFails)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations
            .execute()
            .catch((e) => expect(`${e}`)
            .toContain('Error while updating function code'))
        expect(lambda.getFunction).toBeCalledTimes(1)
        expect(lambda.updateFunctionCode).toBeCalledTimes(1)
    })

    test('Fails to deploy fails', async () => {
        expect.assertions(3)
        const taskParameters = {...baseTaskParameters}
        taskParameters.deploymentMode = deployCodeOnly
        taskParameters.roleARN = 'arn:yes'
        const lambda = new Lambda() as any
        lambda.getFunction = jest.fn(() => getFunctionFails)
        lambda.updateFunctionCode = jest.fn(() => updateFunctionFails)
        const taskOperations = new TaskOperations(new IAM(), lambda, taskParameters)
        await taskOperations
            .execute()
            .catch((e) => expect(`${e}`)
            .toContain('Error while updating function code'))
        expect(lambda.getFunction).toBeCalledTimes(1)
        expect(lambda.updateFunctionCode).toBeCalledTimes(1)
    })

    test('Deploy only Function does not exist fails', () => {
        return undefined
    })

    test('Deploy only Function exists calls update', () => {
        return undefined
    })

    test('Deploy and config does not exist calls create', () => {
        return undefined
    })

    test('Deploy and config exists calls upate', () => {
        return undefined
    })

    test('Create function adds fields if they exist', () => {
        return undefined
    })

    test('Update function adds fields if they exist', () => {
        return undefined
    })
})
