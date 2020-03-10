/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { Lambda } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaInvokeFunction/TaskOperations'
import { TaskParameters } from '../../../Tasks/LambdaInvokeFunction/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    functionName: 'coolfunction',
    payload: '',
    invocationType: '',
    logType: '',
    outputVariable: ''
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
    promise: function(): Lambda.InvocationResponse {
        return {
            Payload: 'payload'
        }
    }
}

const invokeLambdaSucceedsNoResponse = {
    promise: function() {
        return {
            Payload: undefined
        }
    }
}

describe('Lambda Invoke', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/LambdaInvokeFunction/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new Lambda(), baseTaskParameters)).not.toBeNull()
    })

    test('Handles a null service response', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.outputVariable = 'something'
        await assertPayloadCorrect(
            taskParameters,
            jest.fn(params => {
                // expectation to make sure the callback is called
                expect(1).toBe(1)

                return invokeLambdaSucceedsNoResponse
            })
        )
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

    test('Handles JSON Objects Property', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        const payload = '{"key": "value"}'
        taskParameters.payload = payload
        await assertPayloadCorrect(
            taskParameters,
            jest.fn(params => {
                expect(params.Payload.toString('utf8')).toBe(payload)

                return invokeLambdaSucceeds
            })
        )
    })

    test('Handles JSON Arrays Property', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        const payload = '   ["key", "value"]      '
        taskParameters.payload = payload
        await assertPayloadCorrect(
            taskParameters,
            jest.fn(params => {
                expect(params.Payload.toString('utf8')).toBe(payload)

                return invokeLambdaSucceeds
            })
        )
    })

    test('Handles JSON Strings Property', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        const payload = '"key"'
        taskParameters.payload = payload
        await assertPayloadCorrect(
            taskParameters,
            jest.fn(params => {
                expect(params.Payload.toString('utf8')).toBe(payload)

                return invokeLambdaSucceeds
            })
        )
    })

    test('Sringifies non-json property', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        const payload = 'This is a "string'
        taskParameters.payload = payload
        await assertPayloadCorrect(
            taskParameters,
            jest.fn(params => {
                expect(params.Payload.toString('utf8')).toBe('"This is a \\"string"')

                return invokeLambdaSucceeds
            })
        )
    })

    test('Sringifies tricky non-json property', async () => {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        const payload = '"This [is a strin{}"g'
        taskParameters.payload = payload
        await assertPayloadCorrect(
            taskParameters,
            jest.fn(params => {
                expect(params.Payload.toString('utf8')).toBe('"\\"This [is a strin{}\\"g"')

                return invokeLambdaSucceeds
            })
        )
    })

    async function assertPayloadCorrect(taskParameters: any, callback: (params: any) => any) {
        const lambda = new Lambda() as any
        lambda.getFunctionConfiguration = jest.fn(() => getFunctionSucceeds)
        lambda.invoke = callback
        const taskOperations = new TaskOperations(lambda, taskParameters)
        await taskOperations.execute()
        expect(lambda.invoke).toBeCalledTimes(1)
        expect(lambda.getFunctionConfiguration).toBeCalledTimes(1)
    }
})
