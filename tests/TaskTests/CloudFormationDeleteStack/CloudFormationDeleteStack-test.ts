/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/CloudFormationDeleteStack/TaskOperations'
import { TaskParameters } from '../../../Tasks/CloudFormationDeleteStack/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    stackName: 'name'
}

const describeFails = {
    promise: function() {
        throw new Error("doesn't exist")
    }
}

const describeSucceeds = {
    promise: () => undefined
}

describe('Cloud formation delete stack', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/CloudFormationDeleteStack/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CloudFormation(), defaultTaskParameters)).not.toBeNull()
    })

    test('Verify resource exist fails, fails task', async () => {
        expect.assertions(1)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeStacks = jest.fn(() => describeFails)
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(err.message).toContain('Stack name does not exist')
        })
    })

    test('Stack deletion fails, fails task', async () => {
        expect.assertions(1)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeStacks = jest.fn(() => describeSucceeds)
        cloudFormation.deleteStack = jest.fn(() => describeFails)
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(err.message).toContain("doesn't exist")
        })
    })

    test('Wait for stack deletion fails, fails task', async () => {
        expect.assertions(1)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeStacks = jest.fn(() => describeSucceeds)
        cloudFormation.deleteStack = jest.fn(() => describeSucceeds)
        cloudFormation.waitFor = jest.fn(() => describeFails)
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(err.message).toContain('failed to reach delete completion status')
        })
    })

    test('Happy path', async () => {
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeStacks = jest.fn(() => describeSucceeds)
        cloudFormation.deleteStack = jest.fn(() => describeSucceeds)
        cloudFormation.waitFor = jest.fn(() => describeSucceeds)
        const taskOperations = new TaskOperations(cloudFormation, defaultTaskParameters)
        await taskOperations.execute()
    })
})
