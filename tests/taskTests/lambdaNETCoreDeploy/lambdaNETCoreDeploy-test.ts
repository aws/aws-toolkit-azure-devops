/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SdkUtils } from 'lib/sdkutils'
import { join } from 'path'
import { TaskOperations } from 'tasks/LambdaNETCoreDeploy/TaskOperations'
import { TaskParameters } from 'tasks/LambdaNETCoreDeploy/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    command: '',
    packageOnly: false,
    lambdaProjectPath: '',
    packageOutputFile: '',
    functionHandler: '',
    functionName: '',
    functionRole: '',
    functionMemory: 0,
    functionTimeout: 0,
    stackName: '',
    s3Bucket: '',
    s3Prefix: '',
    additionalArgs: ''
}

const executable = join(__dirname, '../../resources/echo.bat')

describe('Lambda NET Core Deploy', () => {
    // TODO https://github.com/aws/aws-toolkit-azure-devops/issues/167
    beforeAll(() => {
        process.env.AWS_REGION = 'region'
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/LambdaNETCoreDeploy/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(undefined, '', '', baseTaskParameters)).not.toBeNull()
    })

    test('Project path does not exist', async () => {
        expect.assertions(1)
        const taskOperation = new TaskOperations(undefined, executable, 'echo', baseTaskParameters)
        await taskOperation.execute().catch(e => {
            expect(`${e}`).toContain('does not exist')
        })
    })

    test('Unknown command throws', async () => {
        expect.assertions(1)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        taskParameters.command = 'Command that will throw'
        const taskOperation = new TaskOperations(undefined, executable, 'echo', taskParameters)
        await taskOperation.execute().catch(e => {
            expect(`${e}`).toContain('Unknown deployment type: Command that will throw')
        })
    })

    test('Netcore binary not found throws', async () => {
        expect.assertions(1)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        const taskOperation = new TaskOperations(undefined, '/invalid/path/', 'echo', taskParameters)
        await taskOperation.execute().catch(e => {
            expect(`${e}`).toContain("Error: Unable to locate executable file: '/invalid/path/'")
        })
    })

    test('Happy path deploy', async () => {
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        taskParameters.command = 'deployFunction'
        const taskOperation = new TaskOperations(undefined, executable, 'echo', taskParameters)
        await taskOperation.execute()
    })

    test('Happy path package only', async () => {
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        taskParameters.command = 'deployFunction'
        taskParameters.packageOnly = true
        const taskOperation = new TaskOperations(undefined, executable, 'echo', taskParameters)
        await taskOperation.execute()
    })

    test('Happy path deploy serverless', async () => {
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        taskParameters.command = 'deployServerless'
        taskParameters.functionTimeout = 60
        const taskOperation = new TaskOperations(undefined, executable, 'echo', taskParameters)
        await taskOperation.execute()
    })
})
