/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation, S3 } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/CloudFormationCreateOrUpdateStack/TaskOperations'
import { TaskParameters } from '../../../Tasks/CloudFormationCreateOrUpdateStack/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
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

// NOTE: these tests are too hard to write, fucntional tests will not work the module as is. We need to break
// up the moudule so that we can actually test, see issue https://github.com/aws/aws-vsts-tools/issues/213
describe('Cloud Formation create or update', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/SendMessage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CloudFormation(), new S3(), defaultTaskParameters)).not.toBeNull()
    })
})
