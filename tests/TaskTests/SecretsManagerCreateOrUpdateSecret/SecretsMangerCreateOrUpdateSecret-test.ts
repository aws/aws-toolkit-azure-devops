/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SecretsManager } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SecretsManagerCreateOrUpdateSecret/TaskOperations'
import { inlineSecretSource, TaskParameters } from '../../../Tasks/SecretsManagerCreateOrUpdateSecret/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    secretNameOrId: undefined,
    description: undefined,
    kmsKeyId: undefined,
    secretValueType: undefined,
    secretValueSource: inlineSecretSource,
    secretValue: undefined,
    secretValueFile: undefined,
    autoCreateSecret: false,
    tags: [],
    arnOutputVariable: undefined,
    versionIdOutputVariable: undefined
}

const secretsManagerFails = {
    promise: function() { throw new Error('doesn\'t exist') }
}

const secretsManagerReturnsString = {
    promise: function() { return {SecretString: 'string'} }
}

const secretsManagerReturnsBadBase64 = {
    promise: function() { return {SecretBinary: 'strOo0ing'} }
}

const secretsManagerReturnsValidBase64 = {
    promise: function() { return {SecretBinary: 'YWJjCg=='} }
}

const assertAbc = {
    promise: function(request: any) {
        expect(request.VersionId).toBe('abc')
        expect(request.versionStage).toBe(undefined)
    }
}

describe('Secrets Manger Create Or Update Secret', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SecretsManagerCreateOrUpdateSecret/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SecretsManager(), defaultTaskParameters)).not.toBeNull()
    })

    test('Secret update fails, fails task', async () => {
        expect.assertions(1)
        const secretsManager = new SecretsManager() as any
        secretsManager.putSecretValue = jest.fn(() => secretsManagerFails)
        const taskOperations = new TaskOperations(secretsManager, defaultTaskParameters)
        await taskOperations.execute().catch((e) => expect(e.message).toContain('Error updating secret'))
    })
})
