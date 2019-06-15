/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ElasticBeanstalk, S3 } from 'aws-sdk'

import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/BeanstalkDeployApplication/TaskOperations'
import { TaskParameters } from '../../../Tasks/BeanstalkDeployApplication/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    applicationName: undefined,
    environmentName: undefined,
    applicationType: undefined,
    versionLabel: undefined,
    webDeploymentArchive: undefined,
    dotnetPublishPath: undefined,
    deploymentBundleBucket: undefined,
    deploymentBundleKey: undefined,
    description: undefined,
    outputVariable: undefined,
    eventPollingDelay: undefined
}

// NOTE: most of the actual functionality for elastic beanstalk is in the ElasticBeanstalkUtils, so
// most of the tests are there,
// NOTE: these tests are like cloudformation and too hard to write, we should be able to break it up
// even more which will make it easier to test
describe('Beanstalk Deploy Application', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/BeanstalkDeployApplication/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new ElasticBeanstalk(), new S3(), defaultTaskParameters)).not.toBeNull()
    })
})
