/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation, S3 } from 'aws-sdk'
import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/CloudFormationCreateOrUpdateStack/TaskOperations'
import { TaskParameters } from 'tasks/CloudFormationCreateOrUpdateStack/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    stackName: '',
    templateSource: '',
    templateFile: '',
    s3BucketName: '',
    s3ObjectKey: '',
    templateUrl: '',
    templateParametersSource: '',
    templateParametersFile: '',
    templateParameters: '',
    useChangeSet: false,
    changeSetName: '',
    description: '',
    autoExecuteChangeSet: false,
    capabilityIAM: false,
    capabilityNamedIAM: false,
    capabilityAutoExpand: false,
    roleARN: '',
    notificationARNs: [],
    resourceTypes: [],
    tags: [],
    monitorRollbackTriggers: false,
    monitoringTimeInMinutes: 0,
    rollbackTriggerARNs: [],
    onFailure: '',
    warnWhenNoWorkNeeded: false,
    outputVariable: '',
    captureStackOutputs: '',
    captureAsSecuredVars: false,
    timeoutInMins: 30
}

// NOTE: these tests are too hard to write, fucntional tests will not work the module as is. We need to break
// up the moudule so that we can actually test, see issue https://github.com/aws/aws-vsts-tools/issues/213
describe('Cloud Formation create or update', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/SendMessage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CloudFormation(), new S3(), defaultTaskParameters)).not.toBeNull()
    })
})
