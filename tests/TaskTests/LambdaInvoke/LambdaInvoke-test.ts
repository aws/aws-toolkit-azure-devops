/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { Lambda } from 'aws-sdk'
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaInvokeFunction/TaskOperations'
import { TaskParameters } from '../../../Tasks/LambdaInvokeFunction/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    functionName: 'coolfunction',
    payload: undefined,
    invocationType: undefined,
    logType: undefined,
    outputVariable: undefined
}

const awsResponseThrows = {
    promise: function() {
        throw new Error('function nonexistent')
    }
}

const getFunctionSucceeds = {
    promise: function() {}
}

const invokeLambdaSucceeds = {
    promise: function() {
        return {
            Payload: 'payload'
        }
    }
}

describe('Lambda Invoke', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/LambdaInvokeFunction/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new Lambda(), baseTaskParameters)).not.toBeNull()
    })

    test("Fails when lambda doesn't exist", async () => {
        expect.assertions(1)
        const lambda = new Lambda() as any
        lambda.getFunctionConfiguration = jest.fn(() => awsResponseThrows)
        const taskOperations = new TaskOperations(lambda, baseTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('coolfunction does not exist'))
    })

    test('Fails when lambda invoke fails', async () => {
        expect.assertions(1)
        const lambda = new Lambda() as any
        lambda.getFunctionConfiguration = jest.fn(() => getFunctionSucceeds)
        lambda.invoke = jest.fn(() => awsResponseThrows)
        const taskOperations = new TaskOperations(lambda, baseTaskParameters)
        // it re-throws the exception, so we check for that
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('function nonexistent'))
    })

    test('Happy path, reads function invoke output', async () => {
        expect.assertions(2)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.outputVariable = 'LambdaInvokeResult'
        const lambda = new Lambda() as any
        lambda.getFunctionConfiguration = jest.fn(() => getFunctionSucceeds)
        lambda.invoke = jest.fn(() => invokeLambdaSucceeds)
        const taskOperations = new TaskOperations(lambda, taskParameters)
        await taskOperations.execute()
        const taskOperationsWithBase = new TaskOperations(lambda, baseTaskParameters)
        await taskOperationsWithBase.execute()
        expect(lambda.invoke).toBeCalledTimes(2)
        expect(lambda.getFunctionConfiguration).toBeCalledTimes(2)
    })
})
