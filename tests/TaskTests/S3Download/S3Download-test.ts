/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3 } from 'aws-sdk'
import * as fs from 'fs'
import { Readable as ReadableStream } from 'stream'
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/S3Download/DownloadTaskOperations'
import { TaskParameters } from '../../../Tasks/S3Download/DownloadTaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

describe('S3 Download', () => {
    const baseTaskParameters: TaskParameters = {
        awsConnectionParameters: undefined,
        bucketName: '',
        sourceFolder: '',
        targetFolder: '',
        globExpressions: undefined,
        overwrite: false,
        forcePathStyleAddressing: false,
        flattenFolders: false,
        keyManagement: '',
        customerKey: undefined
    }

    const headBucketResponse = {
        promise: function() { }
    }
    const listObjectsResponse = {
        promise: function() {
            return { NextMarker: undefined, Contents: undefined}
        }
    }
    const listObjectsResponseWithContents = {
        promise: function() {
            return { NextMarker: undefined, Contents: [{Key: 'test', Value: 'value'}]}
        }
    }
    const getObjectWithContents = {
        createReadStream: function() {
            const dataStream = new ReadableStream()
            dataStream.push('data')
            // tslint:disable-next-line:no-null-keyword
            dataStream.push(null)

            return dataStream
        }
    }
    const targetFolder: string = 'folder'

    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/S3Download/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = baseTaskParameters
        expect(new TaskOperations(undefined, taskParameters)).not.toBeNull()
    })

    test('Handles not being able to connect to a bucket', async () => {
        const s3 = new S3({ region: 'us-east-1' })
        s3.headBucket = jest.fn()((params, cb) => { throw new Error('doesn\'t exist dummy') })
        const taskParameters = baseTaskParameters
        const taskOperation = new TaskOperations(s3, taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch((e) => { expect(e.message).toContain('not exist') })
    })

    test('Deals with null list objects succeeds', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn((params, cb) => headBucketResponse)
        s3.listObjects = jest.fn((params, cb) => listObjectsResponse)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = targetFolder
        taskParameters.bucketName = 'what'
        // required parameter
        taskParameters.globExpressions = []
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute()
    })

    test('Happy path matches all', async () => {
        try {fs.unlinkSync(targetFolder + '2/test') } catch (e) {}
        try {fs.rmdirSync(targetFolder + '2') } catch (e) {}
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn((params, cb) => headBucketResponse)
        s3.listObjects = jest.fn((params, cb) => listObjectsResponseWithContents)
        s3.getObject = jest.fn((params, cb) => getObjectWithContents)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = targetFolder + '2'
        taskParameters.bucketName = 'bucket'
        taskParameters.globExpressions = ['*']
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute()
    })

    afterAll(() => {
        // cleanup created folders
        try {fs.rmdirSync(targetFolder) } catch (e) {}
        try {fs.unlinkSync(targetFolder + '2/test') } catch (e) {}
        try {fs.rmdirSync(targetFolder + '2') } catch (e) {}
    })
})
