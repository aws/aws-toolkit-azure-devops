/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ElasticBeanstalk, S3 } from 'aws-sdk'

import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/BeanstalkDeployApplication/TaskOperations'
import { TaskParameters } from 'tasks/BeanstalkDeployApplication/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    applicationName: '',
    environmentName: '',
    applicationType: '',
    versionLabel: '',
    webDeploymentArchive: '',
    dotnetPublishPath: '',
    deploymentBundleBucket: '',
    deploymentBundleKey: '',
    description: '',
    outputVariable: '',
    eventPollingDelay: 0
}

// NOTE: most of the actual functionality for elastic beanstalk is in the ElasticBeanstalkUtils, so
// most of the tests are there,
// NOTE: these tests are like cloudformation and too hard to write, we should be able to break it up
// even more which will make it easier to test
describe('Beanstalk Deploy Application', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/BeanstalkDeployApplication/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new ElasticBeanstalk(), new S3(), defaultTaskParameters)).not.toBeNull()
    })
})
