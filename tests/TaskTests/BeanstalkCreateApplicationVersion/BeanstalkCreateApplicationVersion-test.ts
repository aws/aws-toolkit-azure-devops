/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ElasticBeanstalk, S3 } from 'aws-sdk'

import { SdkUtils } from 'Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/BeanstalkCreateApplicationVersion/TaskOperations'
import { TaskParameters } from '../../../Tasks/BeanstalkCreateApplicationVersion/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    applicationName: undefined,
    applicationType: undefined,
    versionLabel: undefined,
    webDeploymentArchive: undefined,
    dotnetPublishPath: undefined,
    deploymentBundleBucket: undefined,
    deploymentBundleKey: undefined,
    description: undefined,
    outputVariable: undefined
}

// NOTE: most of the actual functionality for elastic beanstalk is in the ElasticBeanstalkUtils, so
// most of the tests are there,
describe('Beanstalk Deploy Application', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/BeanstalkCreateApplicationVersion/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new ElasticBeanstalk(), new S3(), defaultTaskParameters)).not.toBeNull()
    })
})
