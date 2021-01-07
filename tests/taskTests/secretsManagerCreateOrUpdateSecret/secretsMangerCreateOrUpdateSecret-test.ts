/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SecretsManager } from 'aws-sdk'
import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/SecretsManagerCreateOrUpdateSecret/TaskOperations'
import { inlineSecretSource, TaskParameters } from 'tasks/SecretsManagerCreateOrUpdateSecret/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    secretNameOrId: '',
    description: '',
    kmsKeyId: '',
    secretValueType: '',
    secretValueSource: inlineSecretSource,
    secretValue: 'super secret',
    secretValueFile: '',
    autoCreateSecret: false,
    tags: [],
    arnOutputVariable: undefined,
    versionIdOutputVariable: undefined
}

const secretsManagerFails = {
    promise: function() {
        throw new Error("doesn't exist")
    }
}

const secretsManagerFailsNotFound = {
    promise: function() {
        throw { code: 'ResourceNotFoundException' }
    }
}

const secretsManagerReturnsCreate = {
    promise: function() {
        return { SecretString: 'string' }
    }
}

describe('Secrets Manger Create Or Update Secret', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/SecretsManagerCreateOrUpdateSecret/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SecretsManager(), defaultTaskParameters)).not.toBeNull()
    })

    test('Secret update fails, fails task', async () => {
        expect.assertions(1)
        const secretsManager = new SecretsManager() as any
        secretsManager.putSecretValue = jest.fn(() => secretsManagerFails)
        const taskOperations = new TaskOperations(secretsManager, defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(e.message).toContain('Error updating secret'))
    })

    test('Secret update fails, goes to create, fails because autocreate off', async () => {
        expect.assertions(1)
        const secretsManager = new SecretsManager() as any
        secretsManager.putSecretValue = jest.fn(() => secretsManagerFailsNotFound)
        const taskOperations = new TaskOperations(secretsManager, defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(e.message).toContain('Specified secret does not exist'))
    })

    test('Secret update fails, goes to create', async () => {
        expect.assertions(1)
        const taskParams = { ...defaultTaskParameters }
        taskParams.autoCreateSecret = true
        const secretsManager = new SecretsManager() as any
        secretsManager.putSecretValue = jest.fn(() => secretsManagerFailsNotFound)
        secretsManager.createSecret = jest.fn(params => {
            expect(params.Name).toStrictEqual('')

            return secretsManagerReturnsCreate
        })
        const taskOperations = new TaskOperations(secretsManager, taskParams)
        await taskOperations.execute()
    })

    test('Secret update, update works', async () => {
        expect.assertions(1)
        const secretsManager = new SecretsManager() as any
        secretsManager.putSecretValue = jest.fn(params => {
            expect(params.Name).toBeUndefined()

            return secretsManagerReturnsCreate
        })
        const taskOperations = new TaskOperations(secretsManager, defaultTaskParameters)
        await taskOperations.execute()
    })

    test('Secret update, description updated seperately', async () => {
        expect.assertions(4)
        const taskParams = { ...defaultTaskParameters }
        taskParams.description = 'descriptive'
        const secretsManager = new SecretsManager() as any
        secretsManager.putSecretValue = jest.fn(params => {
            expect(params.Name).toBeUndefined()

            return secretsManagerReturnsCreate
        })
        secretsManager.updateSecret = jest.fn(params => {
            expect(params.Name).toBeUndefined()

            return secretsManagerReturnsCreate
        })
        const taskOperations = new TaskOperations(secretsManager, taskParams)
        await taskOperations.execute()
        expect(secretsManager.putSecretValue).toBeCalled()
        expect(secretsManager.updateSecret).toBeCalled()
    })
})
