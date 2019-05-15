/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SystemsManager } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SystemsManagerRunCommand/TaskOperations'
import { TaskParameters } from '../../../Tasks/SystemsManagerRunCommand/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    documentName: undefined,
    documentParameters: undefined,
    serviceRoleARN: undefined,
    comment: undefined,
    instanceSelector: undefined,
    instanceIds: undefined,
    instanceTags: undefined,
    instanceBuildVariable: undefined,
    maxConcurrency: undefined,
    maxErrors: undefined,
    timeout: undefined,
    notificationArn: undefined,
    notificationEvents: undefined,
    notificationType: undefined,
    outputS3BucketName: undefined,
    outputS3KeyPrefix: undefined,
    commandIdOutputVariable: undefined
}

const systemsManagerFails = {
    promise: function() { throw new Error('Failed to do anything') }
}

describe('Systems Manager Run Command', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SecretsManagerGetSecret/task.json')
    })
})
