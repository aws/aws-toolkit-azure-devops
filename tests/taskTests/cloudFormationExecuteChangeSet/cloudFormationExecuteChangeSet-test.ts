/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation, S3 } from 'aws-sdk'
import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/CloudFormationExecuteChangeSet/TaskOperations'
import { ignoreStackOutputs, TaskParameters } from 'tasks/CloudFormationExecuteChangeSet/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    changeSetName: '',
    stackName: '',
    deleteEmptyChangeSet: false,
    outputVariable: '',
    captureStackOutputs: '',
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

const changeSetFoundWithNoChanges = {
    promise: () => {
        return {
            StackId: 'yes',
            Status: 'FAILED',
            StatusReason:
                "The submitted information didn't contain changes. Submit different information to create a change set."
        }
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
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/CloudFormationExecuteChangeSet/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CloudFormation(), defaultTaskParameters)).not.toBeNull()
    })

    test('Verify resources exist fails, fails', async () => {
        const cloudFormation = new CloudFormation()
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Change set  does not exist')
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

    test('Resource exists works, change set has no changes, ignores stack output', async () => {
        expect.assertions(4)

        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeChangeSet = jest.fn(() => changeSetFoundWithNoChanges)
        cloudFormation.describeStackResources = jest.fn()
        cloudFormation.executeChangeSet = jest.fn()
        cloudFormation.deleteChangeSet = jest.fn()

        const taskParameters = { ...defaultTaskParameters }
        taskParameters.captureStackOutputs = ignoreStackOutputs

        const taskOperations = new TaskOperations(cloudFormation, taskParameters)
        await taskOperations.execute()

        expect(cloudFormation.describeChangeSet).toBeCalledTimes(1)
        expect(cloudFormation.describeStackResources).toBeCalledTimes(1)
        expect(cloudFormation.executeChangeSet).toBeCalledTimes(0)
        expect(cloudFormation.deleteChangeSet).toBeCalledTimes(0)
    })

    test('Resource exists works, change set has no changes, deletes empty change set, ignores stack output', async () => {
        expect.assertions(4)

        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeChangeSet = jest.fn(() => changeSetFoundWithNoChanges)
        cloudFormation.describeStackResources = jest.fn()
        cloudFormation.executeChangeSet = jest.fn()

        const deleteSucceeded = {
            promise: () => undefined
        }
        cloudFormation.deleteChangeSet = jest.fn(() => deleteSucceeded)

        const taskParameters = { ...defaultTaskParameters }
        taskParameters.captureStackOutputs = ignoreStackOutputs
        taskParameters.deleteEmptyChangeSet = true

        const taskOperations = new TaskOperations(cloudFormation, taskParameters)
        await taskOperations.execute()

        expect(cloudFormation.describeChangeSet).toBeCalledTimes(1)
        expect(cloudFormation.describeStackResources).toBeCalledTimes(1)
        expect(cloudFormation.executeChangeSet).toBeCalledTimes(0)
        expect(cloudFormation.deleteChangeSet).toBeCalledTimes(1)
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
