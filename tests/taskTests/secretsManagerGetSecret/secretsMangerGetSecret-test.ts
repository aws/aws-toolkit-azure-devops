/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SecretsManager } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SecretsManagerGetSecret/TaskOperations'
import { TaskParameters } from '../../../Tasks/SecretsManagerGetSecret/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    secretIdOrName: '',
    variableName: 'secret',
    versionId: '',
    versionStage: ''
}

const secretsManagerFails = {
    promise: function() {
        throw new Error("doesn't exist")
    }
}

const secretsManagerReturnsString = {
    promise: function() {
        return { SecretString: 'string' }
    }
}

const secretsManagerReturnsBadBase64 = {
    promise: function() {
        return { SecretBinary: 'strOo0ing' }
    }
}

const secretsManagerReturnsValidBase64 = {
    promise: function() {
        return { SecretBinary: 'YWJjCg==' }
    }
}

describe('Secrets Manger Get Secret', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/SecretsManagerGetSecret/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SecretsManager(), defaultTaskParameters)).not.toBeNull()
    })

    test('Fails on exception thrown', async () => {
        const badSecretsManager = new SecretsManager() as any
        badSecretsManager.getSecretValue = jest.fn((params: any, cb: any) => secretsManagerFails)
        const taskOperations = new TaskOperations(badSecretsManager, defaultTaskParameters)
        await taskOperations.execute().catch(e => {
            expect(e.message).toContain("doesn't exist")
        })
    })

    test('Fails on bad base64', async () => {
        const badSecretsManager = new SecretsManager() as any
        badSecretsManager.getSecretValue = jest.fn((params: any, cb: any) => secretsManagerReturnsBadBase64)
        const taskOperations = new TaskOperations(badSecretsManager, defaultTaskParameters)
        await taskOperations.execute().catch(e => {
            expect(e.message).toContain('the string to be decoded is not correctly encoded')
        })
    })

    // NOTE: we cannot check it setting since it uses task lib set which is an exported funciton
    // , not an exported variable that equals a funciton. Maybe in the future we will think of a
    // good way to mock it
    test('Handles secret string', async () => {
        const secretsManager = new SecretsManager() as any
        secretsManager.getSecretValue = jest.fn((params: any, cb: any) => secretsManagerReturnsString)
        const taskOperations = new TaskOperations(secretsManager, defaultTaskParameters)
        await taskOperations.execute()
    })

    // NOTE: we cannot check it setting since it uses task lib set which is an exported funciton
    // , not an exported variable that equals a funciton. Maybe in the future we will think of a
    // good way to mock it
    test('Handles and decodes secret binary', async () => {
        const secretsManager = new SecretsManager() as any
        secretsManager.getSecretValue = jest.fn((params: any, cb: any) => secretsManagerReturnsValidBase64)
        const taskOperations = new TaskOperations(secretsManager, defaultTaskParameters)
        await taskOperations.execute()
    })

    test('Prioritizes version id', async () => {
        const taskParametersWithExtraFields = { ...defaultTaskParameters }
        taskParametersWithExtraFields.versionId = 'abc'
        taskParametersWithExtraFields.versionStage = 'def'
        const secretsManager = new SecretsManager() as any
        secretsManager.getSecretValue = jest.fn((params: any, cb: any) => {
            expect(params.VersionId).toBe('abc')
            expect(params.versionStage).toBe(undefined)

            return secretsManagerReturnsValidBase64
        })
        expect.assertions(2)
        const taskOperations = new TaskOperations(secretsManager, taskParametersWithExtraFields)
        await taskOperations.execute()
    })
})
