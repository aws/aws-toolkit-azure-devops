/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaNETCoreDeploy/TaskOperations'
import { TaskParameters } from '../../../Tasks/LambdaNETCoreDeploy/TaskParameters'

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
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

describe('Lambda NET Core Deploy', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/LambdaNETCoreDeploy/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(undefined, '', baseTaskParameters)).not.toBeNull()
    })

    test('Project path does not exist', async () => {
        expect.assertions(1)
        const taskOperation = new TaskOperations(undefined, 'echo', baseTaskParameters)
        await taskOperation.execute().catch(e => {
            expect(`${e}`).toContain('does not exist')
        })
    })

    test('unknown command throws', async () => {
        expect.assertions(1)
        process.env.AWS_REGION = 'region'
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        taskParameters.command = 'Command that will throw'
        const taskOperation = new TaskOperations(undefined, 'echo', taskParameters)
        await taskOperation.execute().catch(e => {
            expect(`${e}`).toContain('Unknown deployment type: Command that will throw')
        })
    })

    test('Happy path deploy', async () => {
        process.env.AWS_REGION = 'region'
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        taskParameters.command = 'deployFunction'
        const taskOperation = new TaskOperations(undefined, 'echo', taskParameters)
        await taskOperation.execute()
    })

    test('Happy path deploy serverless', async () => {
        process.env.AWS_REGION = 'region'
        const taskParameters = { ...baseTaskParameters }
        taskParameters.lambdaProjectPath = '.'
        taskParameters.command = 'deployServerless'
        const taskOperation = new TaskOperations(undefined, 'echo', taskParameters)
        await taskOperation.execute()
    })
})
