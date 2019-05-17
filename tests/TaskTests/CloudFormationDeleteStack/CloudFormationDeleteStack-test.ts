/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
    stackName: undefined
}

describe('Cloud formation delete stack', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/CloudFormationDeleteStack/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CloudFormation(), defaultTaskParameters)).not.toBeNull()
    })
})
