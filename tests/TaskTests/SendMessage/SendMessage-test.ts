/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SNS, SQS } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SendMessage/TaskOperations'
import { TaskParameters } from '../../../Tasks/SendMessage/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    messageTarget: undefined,
    message: undefined,
    topicArn: undefined,
    queueUrl: undefined,
    delaySeconds: undefined
}

describe('Send Message', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SendMessage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SNS(), new SQS(), defaultTaskParameters)).not.toBeNull()
    })
})
