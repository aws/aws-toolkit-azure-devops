/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation, S3 } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/CloudFormationCreateOrUpdateStack/TaskOperations'
import { TaskParameters } from '../../../Tasks/CloudFormationCreateOrUpdateStack/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    stackName: undefined,
    templateSource: undefined,
    templateFile: undefined,
    s3BucketName: undefined,
    s3ObjectKey: undefined,
    templateUrl: undefined,
    templateParametersSource: undefined,
    templateParametersFile: undefined,
    templateParameters: undefined,
    useChangeSet: undefined,
    changeSetName: undefined,
    description: undefined,
    autoExecuteChangeSet: undefined,
    capabilityIAM: undefined,
    capabilityNamedIAM: undefined,
    capabilityAutoExpand: undefined,
    roleARN: undefined,
    notificationARNs: undefined,
    resourceTypes: undefined,
    tags: undefined,
    monitorRollbackTriggers: undefined,
    monitoringTimeInMinutes: undefined,
    rollbackTriggerARNs: undefined,
    onFailure: undefined,
    warnWhenNoWorkNeeded: undefined,
    outputVariable: undefined,
    captureStackOutputs: undefined,
    captureAsSecuredVars: undefined,
    timeoutInMins: undefined
}

describe('Send Message', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SendMessage/task.json')
    })

    test('Happy path stack exists', () => {
        return undefined
    })

    test('Happy path stack does not exist', () => {
        return undefined
    })
})
