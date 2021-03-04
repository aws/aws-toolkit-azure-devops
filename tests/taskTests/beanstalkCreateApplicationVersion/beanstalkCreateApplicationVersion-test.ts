/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ElasticBeanstalk, S3 } from 'aws-sdk'

import { SdkUtils } from 'lib/sdkutils'
import * as path from 'path'
import { TaskOperations } from 'tasks/BeanstalkCreateApplicationVersion/TaskOperations'
import {
    applicationTypeAspNet,
    applicationTypeAspNetCoreForLinux,
    applicationTypeAspNetCoreForWindows,
    applicationTypeS3Archive,
    TaskParameters
} from 'tasks/BeanstalkCreateApplicationVersion/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

jest.mock('aws-sdk')

const s3BucketResponse = {
    promise: () => ({ S3Bucket: 'bucket' })
}

const verifyApplicationExistsResponse = {
    promise: () => ({ Applications: ['yes'] })
}

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    applicationName: '',
    applicationType: applicationTypeS3Archive,
    versionLabel: '',
    webDeploymentArchive: '',
    dotnetPublishPath: '',
    deploymentBundleBucket: '',
    deploymentBundleKey: '',
    description: '',
    outputVariable: ''
}

// NOTE: most of the actual functionality for elastic beanstalk is in the ElasticBeanstalkUtils, so
// most of the tests are there, ideally all of our tasks will be more like this one in the future
describe('Beanstalk Create Application Version', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/BeanstalkCreateApplicationVersion/task.json')
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

    test('Happy path, aspnet uploads new object to S3', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.applicationType = applicationTypeAspNet
        taskParameters.webDeploymentArchive = path.join(__dirname, '../../resources/beanstalkBundle/doc.txt')
        const s3 = new S3() as any
        s3.upload = jest.fn((args: any) => {
            expect(args.Key).toContain('doc.txt')

            return s3BucketResponse
        })
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createApplicationVersion = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createStorageLocation = jest.fn(() => s3BucketResponse)
        const taskOperations = new TaskOperations(beanstalk, s3, taskParameters)
        await taskOperations.execute()
    })

    test('Happy path, aspnet core Windows uploads new object to S3', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.applicationType = applicationTypeAspNetCoreForWindows
        taskParameters.dotnetPublishPath = path.join(__dirname, '../../resources/beanstalkBundle/')
        const s3 = new S3() as any
        s3.upload = jest.fn((args: any) => {
            expect(args.Key).toContain('ebDeploymentBundle')

            return s3BucketResponse
        })
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createApplicationVersion = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createStorageLocation = jest.fn(() => s3BucketResponse)
        const taskOperations = new TaskOperations(beanstalk, s3, taskParameters)
        await taskOperations.execute()
    })

    test('Happy path, aspnet core Linux uploads new object to S3', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.applicationType = applicationTypeAspNetCoreForLinux
        taskParameters.dotnetPublishPath = path.join(__dirname, '../../resources/beanstalkBundle/')
        const s3 = new S3() as any
        s3.upload = jest.fn((args: any) => {
            expect(args.Key).toContain('ebDeploymentBundle')

            return s3BucketResponse
        })
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createApplicationVersion = jest.fn(() => verifyApplicationExistsResponse)
        beanstalk.createStorageLocation = jest.fn(() => s3BucketResponse)
        const taskOperations = new TaskOperations(beanstalk, s3, taskParameters)
        await taskOperations.execute()
    })
})
