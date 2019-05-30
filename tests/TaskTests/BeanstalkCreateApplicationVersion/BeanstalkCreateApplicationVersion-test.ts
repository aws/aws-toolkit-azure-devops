/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ElasticBeanstalk, S3 } from 'aws-sdk'

import { SdkUtils } from 'Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/BeanstalkCreateApplicationVersion/TaskOperations'
import {
    applicationTypeAspNet,
    applicationTypeS3Archive,
    TaskParameters
} from '../../../Tasks/BeanstalkCreateApplicationVersion/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const s3BucketResponse = {
    promise: () => ({ S3Bucket: 'bucket' })
}

const verifyApplicationExistsResponse = {
    promise: () => ({ Applications: ['yes'] })
}

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    applicationName: undefined,
    applicationType: applicationTypeS3Archive,
    versionLabel: undefined,
    webDeploymentArchive: undefined,
    dotnetPublishPath: undefined,
    deploymentBundleBucket: undefined,
    deploymentBundleKey: undefined,
    description: undefined,
    outputVariable: undefined
}

// NOTE: most of the actual functionality for elastic beanstalk is in the ElasticBeanstalkUtils, so
// most of the tests are there, ideally all of our tasks will be more like this one in the future
describe('Beanstalk Create Application Version', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/BeanstalkCreateApplicationVersion/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new ElasticBeanstalk(), new S3(), defaultTaskParameters)).not.toBeNull()
    })

    test('Create application version throws, fails task', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createApplicationVersion = jest.fn(() => {
            throw new Error('OW!')
        })
        const taskOperations = new TaskOperations(beanstalk, new S3(), defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(err).toStrictEqual(Error('OW!'))
        })
    })

    test('Happy path, object already in S3', async () => {
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createApplicationVersion = jest.fn(() => verifyApplicationExistsResponse)
        const taskOperations = new TaskOperations(beanstalk, new S3(), defaultTaskParameters)
        await taskOperations.execute()
    })

    test('Happy path, uploads new object to S3', async () => {
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.applicationType = applicationTypeAspNet
        taskParameters.webDeploymentArchive = 'web/web.txt'
        const s3 = new S3() as any
        s3.upload = jest.fn(() => s3BucketResponse)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createApplicationVersion = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createStorageLocation = jest.fn(() => s3BucketResponse)
        const taskOperations = new TaskOperations(beanstalk, s3, taskParameters)
        await taskOperations.execute()
    })
})
