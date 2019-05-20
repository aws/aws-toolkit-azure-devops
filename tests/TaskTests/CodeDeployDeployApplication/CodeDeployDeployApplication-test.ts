/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CodeDeploy, S3 } from 'aws-sdk'
import { TaskOperations } from '../../../Tasks/CodeDeployDeployApplication/TaskOperations'
import { revisionSourceFromS3, TaskParameters } from '../../../Tasks/CodeDeployDeployApplication/TaskParameters'
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
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

const emptyPromise = {
    promise: () => ({})
}

describe('CodeDeploy Deploy Application', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/CodeDeployDeployApplication/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CodeDeploy(), new S3(), defaultTaskParameters)).not.toBeNull()
    })

    test('Verify resources exists fails, fails task', async () => {
        expect.assertions(1)
        const taskOperations = new TaskOperations(new CodeDeploy(), new S3(), defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Application undefined does not exist')
        })
    })

    test('Verify deployment group exists fails, fails task', async () => {
        expect.assertions(1)
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, new S3(), defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Deployment group undefined does not exist')
        })
    })

    test('Verify s3 bucket exists fails, fails task', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromS3
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, new S3(), taskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Archive with key undefined does not exist')
        })
    })

    test('Upload needed, fails, fails task', async () => {
        expect.assertions(1)
        const s3 = new S3()
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, s3, defaultTaskParameters)
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
