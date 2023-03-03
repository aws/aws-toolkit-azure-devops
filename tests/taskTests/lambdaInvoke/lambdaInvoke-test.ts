/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { Lambda } from 'aws-sdk'
import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/LambdaInvokeFunction/TaskOperations'
import { TaskParameters } from 'tasks/LambdaInvokeFunction/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

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
    // TODO https://github.com/aws/aws-toolkit-azure-devops/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/LambdaInvokeFunction/task.json')
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
            jest.fn(() => {
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
        await testPayloadsAndOutputs('{"key": "value"}', '{"key": "value"}')
    })

    test('Handles JSON Arrays Property', async () => {
        await testPayloadsAndOutputs('   ["key", "value"]  ', '   ["key", "value"]  ')
    })

    test('Handles JSON Strings Property', async () => {
        await testPayloadsAndOutputs('"key"', '"key"')
    })

    test('Sringifies non-json property', async () => {
        await testPayloadsAndOutputs('This is a "string', '"This is a \\"string"')
    })

    test('Sringifies tricky non-json property', async () => {
        await testPayloadsAndOutputs('"This [is a strin{}"g', '"\\"This [is a strin{}\\"g"')
    })

    test('Quotes numbers for backwards compatability', async () => {
        await testPayloadsAndOutputs('3', '"3"')
    })

    test('Does not stringify possibly valid JSON', async () => {
        await testPayloadsAndOutputs('[{"abc": "def"}', '[{"abc": "def"}')
    })

    async function testPayloadsAndOutputs(input: string, expectedOutput: string) {
        expect.assertions(3)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.payload = input
        await assertPayloadCorrect(
            taskParameters,
            jest.fn(params => {
                expect(params.Payload.toString('utf8')).toBe(expectedOutput)

                return invokeLambdaSucceeds
            })
        )
    }

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
