/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ECR } from 'aws-sdk'
import { DockerHandler } from 'lib/dockerUtils'
import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/ECRPullImage/TaskOperations'
import { TaskParameters } from 'tasks/ECRPullImage/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    imageSource: '',
    imageTag: '',
    imageDigest: '',
    repository: '',
    outputVariable: ''
}

const defaultDocker: DockerHandler = {
    locateDockerExecutable: async () => '',
    runDockerCommand: async (s1, s2, s3) => undefined
}

const ecrFail = {
    promise: function() {
        throw new Error('unauthorized!')
    }
}

const ecrReturnsToken = {
    promise: function() {
        return {
            authorizationData: [
                {
                    authorizationToken: 'TEVUTUVJTgo=',
                    proxyEndpoint: 'https://example.com'
                }
            ]
        }
    }
}

const ecrFailNotFound = {
    promise: function() {
        throw { code: 'RepositoryNotFoundException' }
    }
}

describe('ECR Pull image', () => {
    // TODO https://github.com/aws/aws-toolkit-azure-devops/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/ECRPullImage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new ECR(), defaultDocker, defaultTaskParameters)).not.toBeNull()
    })

    test('Fails when docker executable is failed to be located', async () => {
        expect.assertions(1)
        const dockerHandler = { ...defaultDocker }
        dockerHandler.locateDockerExecutable = () => {
            throw new Error('docker not found')
        }
        const taskOperations = new TaskOperations(new ECR(), dockerHandler, defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('docker not found'))
    })

    test('Fails on failed auth', async () => {
        expect.assertions(2)
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrFail)
        const taskOperations = new TaskOperations(ecr, defaultDocker, defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Failed to obtain'))
        expect(ecr.getAuthorizationToken).toBeCalledTimes(1)
    })

    test('Runs docker commands', async () => {
        expect.assertions(4)
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn((thing1, thing2, thing3) => Promise.resolve())
        dockerHandler.runDockerCommand = runDockerCommand
        const taskOperations = new TaskOperations(ecr, dockerHandler, defaultTaskParameters)
        await taskOperations.execute()
        expect(ecr.getAuthorizationToken).toBeCalledTimes(1)
        expect(runDockerCommand).toBeCalledTimes(2)
        expect(runDockerCommand.mock.calls[0][1]).toBe('login')
        expect(runDockerCommand.mock.calls[1][1]).toBe('pull')
    })

    test('Happy path', async () => {
        expect.assertions(3)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn((thing1, thing2, thing3) => Promise.resolve())
        dockerHandler.runDockerCommand = runDockerCommand
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        ecr.describeRepositories = jest.fn(() => ecrFailNotFound)
        ecr.createRepository = jest.fn(args => ecrReturnsToken)
        const taskParameters = { ...defaultTaskParameters }
        const taskOperations = new TaskOperations(ecr, dockerHandler, taskParameters)
        await taskOperations.execute()
        expect(ecr.getAuthorizationToken).toBeCalledTimes(1)
        expect(runDockerCommand.mock.calls[0][2][2]).toStrictEqual('--password-stdin')
        expect(runDockerCommand.mock.calls[0][2][3]).toStrictEqual('https://example.com')
    })
})
