/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SSM } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SystemsManagerSetParameter/TaskOperations'
import { secureStringType, TaskParameters } from '../../../Tasks/SystemsManagerSetParameter/TaskParameters'

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    parameterName: undefined,
    parameterType: undefined,
    parameterValue: undefined,
    encryptionKeyId: undefined
}

const getParameterFails = {
    promise: function() {
        throw {
            code: 'Internal failure'
        }
    }
}

const getParameterNotFound = {
    promise: function() {
        throw {
            code: 'ParameterNotFound'
        }
    }
}

const getParameterNotSecureString = {
    promise: function() {
        return {
            Parameter: {
                Type: 'not very secure'
            }
        }
    }
}

const getParameterSecureString = {
    promise: function() {
        return {
            Parameter: {
                Type: secureStringType
            }
        }
    }
}

const putParameterSucceeds = {
    promise: function() {}
}

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

describe('Systems Manager Set Parameter', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SystemsManagerSetParameter/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SSM(), defaultTaskParameters)).not.toBeNull()
    })

    test('fails checking parameter, fails task', async () => {
        expect.assertions(2)
        const ssm = new SSM() as any
        ssm.getParameter = jest.fn(() => getParameterFails)
        const taskOperation = new TaskOperations(ssm, defaultTaskParameters)
        await taskOperation
            .execute()
            .catch(e => expect(`${e}`).toContain('An error occurred while accessing the parameter'))
        expect(ssm.getParameter).toBeCalledTimes(1)
    })

    test('fails, fails task', async () => {
        expect.assertions(3)
        const ssm = new SSM() as any
        ssm.getParameter = jest.fn(() => getParameterNotFound)
        ssm.putParameter = jest.fn(() => getParameterNotFound)
        const taskOperation = new TaskOperations(ssm, defaultTaskParameters)
        await taskOperation
            .execute()
            .catch(e => expect(`${e}`).toContain('Create or update of parameter failed with error'))
        expect(ssm.getParameter).toBeCalledTimes(1)
        expect(ssm.putParameter).toBeCalledTimes(1)
    })

    test('checks if it exists yet, is secure string', async () => {
        expect.assertions(3)
        const ssm = new SSM() as any
        ssm.getParameter = jest.fn(() => getParameterSecureString)
        ssm.putParameter = jest.fn(argument => {
            expect(argument.Type).toBe('SecureString')

            return putParameterSucceeds
        })
        const taskOperation = new TaskOperations(ssm, defaultTaskParameters)
        await taskOperation.execute()
        expect(ssm.getParameter).toBeCalledTimes(1)
        expect(ssm.putParameter).toBeCalledTimes(1)
    })

    test('checks if it exists yet, is not secure string', async () => {
        expect.assertions(3)
        const ssm = new SSM() as any
        ssm.getParameter = jest.fn(() => getParameterNotSecureString)
        ssm.putParameter = jest.fn(argument => {
            expect(argument.Type).toBe(undefined)

            return putParameterSucceeds
        })
        const taskOperation = new TaskOperations(ssm, defaultTaskParameters)
        await taskOperation.execute()
        expect(ssm.getParameter).toBeCalledTimes(1)
        expect(ssm.putParameter).toBeCalledTimes(1)
    })
})
