/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation, S3 } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/CloudFormationExecuteChangeSet/TaskOperations'
import { TaskParameters } from '../../../Tasks/CloudFormationExecuteChangeSet/TaskParameters'

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

    test('Verify resources exist fails, does not check if stack has resources', async () => {
        return undefined
    })

    test('Verify resources exist fails, checks if stack has resources', async () => {
        return undefined
    })

    test('Execute change set fails, fails task', async () => {
        return undefined
    })

    test('Execute and wait for update', async () => {
        return undefined
    })

    test('Execute and wait for creation', async () => {
        return undefined
    })

    test('Happy path, capure stack output', async () => {
        return undefined
    })
})
