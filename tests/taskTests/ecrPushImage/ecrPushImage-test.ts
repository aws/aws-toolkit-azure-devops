/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ECR } from 'aws-sdk'
import { DockerHandler } from 'Common/dockerUtils'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/ECRPushImage/TaskOperations'
import { imageNameSource, TaskParameters } from '../../../Tasks/ECRPushImage/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    imageSource: '',
    sourceImageName: '',
    sourceImageTag: '',
    sourceImageId: '',
    repositoryName: '',
    pushTag: '',
    autoCreateRepository: false,
    forceDockerNamingConventions: false,
    outputVariable: ''
}

const defaultDocker: DockerHandler = {
    locateDockerExecutable: async () => '',
    runDockerCommand: async () => undefined
}

const ecrFail = {
    promise: function() {
        throw new Error('unauthorized!')
    }
}

const ecrFailNotFound = {
    promise: function() {
        throw { code: 'RepositoryNotFoundException' }
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

describe('ECR Push image', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/ECRPushImage/task.json')
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
        expect.assertions(5)
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn(async (thing1, thing2, thing3) => undefined)
        dockerHandler.runDockerCommand = runDockerCommand
        const taskOperations = new TaskOperations(ecr, dockerHandler, defaultTaskParameters)
        await taskOperations.execute()
        expect(ecr.getAuthorizationToken).toBeCalledTimes(1)
        expect(runDockerCommand).toBeCalledTimes(3)
        expect(runDockerCommand.mock.calls[0][1]).toBe('tag')
        expect(runDockerCommand.mock.calls[1][1]).toBe('login')
        expect(runDockerCommand.mock.calls[2][1]).toBe('push')
    })

    test('autocreate creates repository', async () => {
        expect.assertions(3)
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        ecr.describeRepositories = jest.fn(() => ecrFailNotFound)
        ecr.createRepository = jest.fn(args => {
            expect(args.repositoryName).toBe('name')

            return ecrReturnsToken
        })
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.autoCreateRepository = true
        taskParameters.repositoryName = 'name'
        const taskOperations = new TaskOperations(ecr, defaultDocker, taskParameters)
        await taskOperations.execute()
        expect(ecr.getAuthorizationToken).toBeCalledTimes(1)
        expect(ecr.describeRepositories).toBeCalledTimes(1)
    })

    test('Happy path', async () => {
        expect.assertions(3)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn(async (thing1, thing2, thing3) => undefined)
        dockerHandler.runDockerCommand = runDockerCommand
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        ecr.describeRepositories = jest.fn(() => ecrFailNotFound)
        ecr.createRepository = jest.fn(args => ecrReturnsToken)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.autoCreateRepository = true
        taskParameters.repositoryName = 'name'
        taskParameters.imageSource = imageNameSource
        const taskOperations = new TaskOperations(ecr, dockerHandler, taskParameters)
        await taskOperations.execute()
        expect(ecr.getAuthorizationToken).toBeCalledTimes(1)
        expect(ecr.describeRepositories).toBeCalledTimes(1)
        expect(runDockerCommand.mock.calls[0][2]).toStrictEqual(['', 'example.com/name'])
    })

    test('Docker naming conventions; replace uppercase', async () => {
        expect.assertions(1)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn(async (thing1, thing2, thing3) => undefined)
        dockerHandler.runDockerCommand = runDockerCommand
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        ecr.describeRepositories = jest.fn(() => ecrFailNotFound)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.forceDockerNamingConventions = true
        taskParameters.repositoryName = 'RepoName'
        const taskOperations = new TaskOperations(ecr, dockerHandler, taskParameters)
        await taskOperations.execute()
        expect(runDockerCommand.mock.calls[0][2]).toStrictEqual(['', 'example.com/reponame'])
    })

    test('Docker naming conventions; keep valid characters', async () => {
        expect.assertions(1)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn(async (thing1, thing2, thing3) => undefined)
        dockerHandler.runDockerCommand = runDockerCommand
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        ecr.describeRepositories = jest.fn(() => ecrFailNotFound)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.forceDockerNamingConventions = true
        taskParameters.repositoryName = 'my-repo.name_01'
        const taskOperations = new TaskOperations(ecr, dockerHandler, taskParameters)
        await taskOperations.execute()
        expect(runDockerCommand.mock.calls[0][2]).toStrictEqual(['', 'example.com/my-repo.name_01'])
    })

    test('Docker naming conventions; remove invalid characters', async () => {
        expect.assertions(1)
        const dockerHandler = { ...defaultDocker }
        const runDockerCommand = jest.fn(async (thing1, thing2, thing3) => undefined)
        dockerHandler.runDockerCommand = runDockerCommand
        const ecr = new ECR() as any
        ecr.getAuthorizationToken = jest.fn(() => ecrReturnsToken)
        ecr.describeRepositories = jest.fn(() => ecrFailNotFound)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.forceDockerNamingConventions = true
        taskParameters.repositoryName = 'm!y@r #e$p%o^n&a*m(e)'
        const taskOperations = new TaskOperations(ecr, dockerHandler, taskParameters)
        await taskOperations.execute()
        expect(runDockerCommand.mock.calls[0][2]).toStrictEqual(['', 'example.com/myreponame'])
    })
})
