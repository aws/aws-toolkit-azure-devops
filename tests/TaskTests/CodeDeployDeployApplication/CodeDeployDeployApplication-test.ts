/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CodeDeploy, S3 } from 'aws-sdk'
import { TaskOperations } from '../../../Tasks/CodeDeployDeployApplication/TaskOperations'
import { TaskParameters } from '../../../Tasks/CodeDeployDeployApplication/TaskParameters'
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    applicationName: undefined,
    deploymentGroupName: undefined,
    deploymentRevisionSource: undefined,
    revisionBundle: undefined,
    bucketName: undefined,
    bundlePrefix: undefined,
    bundleKey: undefined,
    description: undefined,
    fileExistsBehavior: undefined,
    updateOutdatedInstancesOnly: undefined,
    ignoreApplicationStopFailures: undefined,
    outputVariable: undefined,
    timeoutInMins: undefined
}

describe('CodeDeploy Deploy Application', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/CodeDeployDeployApplication/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CodeDeploy(), new S3(), baseTaskParameters)).not.toBeNull()
    })

    test('Verify create resources fails, fails task', async () => {
        expect.assertions(1)
        const taskOperations = new TaskOperations(new CodeDeploy(), new S3(), baseTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Application undefined does not exist')
        })
    })

    test('Upload needed, fails, fails task', async () => {
        expect.assertions(1)
        const codeDeploy = new CodeDeploy()
        const s3 = new S3()
        const taskOperations = new TaskOperations(codeDeploy, s3, baseTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Application undefined does not exist')
        })
    })

    test('Upload needed, succeeds', () => {
        return undefined
    })

    test('Upload not needed, succeeds', () => {
        return undefined
    })

    test('Wait for deployment, fails, fails task', () => {
        return undefined
    })

    test('Happy path', () => {
        return undefined
    })
})
