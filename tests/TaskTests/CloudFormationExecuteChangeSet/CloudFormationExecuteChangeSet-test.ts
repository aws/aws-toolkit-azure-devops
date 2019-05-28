/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation, S3 } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/CloudFormationExecuteChangeSet/TaskOperations'
import { ignoreStackOutputs, TaskParameters } from '../../../Tasks/CloudFormationExecuteChangeSet/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    changeSetName: undefined,
    stackName: undefined,
    outputVariable: undefined,
    captureStackOutputs: undefined,
    captureAsSecuredVars: false
}

const changeSetNotFound = {
    promise: () => {
        return { StackId: undefined }
    }
}

const changeSetFound = {
    promise: () => {
        return { StackId: 'yes' }
    }
}

const cloudFormationHasResourcesSucceeds = {
    promise: function() {
        return {
            StackResources: [{ StackId: 'yes' }]
        }
    }
}

// NOTE: these tests are too hard to write, fucntional tests will not work the module as is. We need to break
// up the moudule so that we can actually test
describe('Cloud Formation Execute Change Set', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/CloudFormationExecuteChangeSet/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CloudFormation(), defaultTaskParameters)).not.toBeNull()
    })

    test('Verify resources exist fails, fails', async () => {
        const cloudFormation = new CloudFormation()
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Change set undefined does not exist')
        })
    })

    test('Resource does not exist, does not check if stack has resources', async () => {
        expect.assertions(2)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeChangeSet = jest.fn(() => changeSetNotFound)
        cloudFormation.describeStackResources = jest.fn()
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('executeChangeSet is not a function')
        })
        expect(cloudFormation.describeStackResources).toBeCalledTimes(0)
    })

    test('Resource exists works, checks if stack has resources', async () => {
        expect.assertions(2)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeChangeSet = jest.fn(() => changeSetFound)
        cloudFormation.describeStackResources = jest.fn()
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('executeChangeSet is not a function')
        })
        expect(cloudFormation.describeStackResources).toBeCalledTimes(1)
    })

    test('Execute change set fails, fails task', async () => {
        expect.assertions(1)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeChangeSet = jest.fn(() => changeSetNotFound)
        cloudFormation.executeChangeSet = jest.fn(() => ({
            promise: () => {
                throw new Error('no')
            }
        }))
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(err).toStrictEqual(new Error('no'))
        })
    })

    test('Execute and wait for update', async () => {
        expect.assertions(2)
        const cloudFormation = new CloudFormation() as any
        const waitFor = jest.fn(arg1 => ({ promise: () => undefined }))
        cloudFormation.describeChangeSet = jest.fn(() => changeSetFound)
        cloudFormation.describeStackResources = jest.fn(() => cloudFormationHasResourcesSucceeds)
        cloudFormation.waitFor = waitFor
        cloudFormation.executeChangeSet = jest.fn(() => ({ promise: () => undefined }))
        cloudFormation.describeStacks = jest.fn(() => ({ promise: () => undefined }))
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute()
        expect(waitFor).toBeCalledTimes(1)
        expect(waitFor.mock.calls[0][0]).toEqual('stackUpdateComplete')
    })

    test('Execute and wait for creation', async () => {
        expect.assertions(2)
        const cloudFormation = new CloudFormation() as any
        const waitFor = jest.fn(arg1 => ({ promise: () => undefined }))
        cloudFormation.describeChangeSet = jest.fn(() => changeSetFound)
        cloudFormation.describeStackResources = jest.fn(() => ({
            promise: () => {
                throw new Error('no')
            }
        }))
        cloudFormation.waitFor = waitFor
        cloudFormation.executeChangeSet = jest.fn(() => ({ promise: () => undefined }))
        cloudFormation.describeStacks = jest.fn(() => ({ promise: () => undefined }))
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute()
        expect(waitFor).toBeCalledTimes(1)
        expect(waitFor.mock.calls[0][0]).toEqual('stackCreateComplete')
    })

    test('Happy Path ignores stack output', async () => {
        expect.assertions(1)
        const cloudFormation = new CloudFormation() as any
        const waitFor = jest.fn(arg1 => ({ promise: () => undefined }))
        cloudFormation.describeChangeSet = jest.fn(() => changeSetFound)
        cloudFormation.describeStackResources = jest.fn(() => ({
            promise: () => {
                throw new Error('no')
            }
        }))
        cloudFormation.waitFor = waitFor
        cloudFormation.executeChangeSet = jest.fn(() => ({ promise: () => undefined }))
        cloudFormation.describeStacks = jest.fn(() => ({ promise: () => undefined }))
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.captureStackOutputs = ignoreStackOutputs
        const taskOperations = new TaskOperations(cloudFormation, taskParameters)
        await taskOperations.execute()
        expect(cloudFormation.describeStacks).toBeCalledTimes(0)
    })
})
