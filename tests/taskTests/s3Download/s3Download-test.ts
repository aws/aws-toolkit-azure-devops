/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3 } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { Readable as ReadableStream } from 'stream'
import * as tmp from 'tmp'
import { TaskOperations } from '../../../Tasks/S3Download/TaskOperations'
import { TaskParameters } from '../../../Tasks/S3Download/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

describe('S3 Download', () => {
    let directory: tmp.DirResult

    const baseTaskParameters: TaskParameters = {
        awsConnectionParameters: emptyConnectionParameters,
        bucketName: '',
        sourceFolder: '',
        targetFolder: '',
        globExpressions: [],
        overwrite: false,
        forcePathStyleAddressing: false,
        flattenFolders: false,
        keyManagement: '',
        customerKey: Buffer.from([])
    }

    const headBucketResponse = {
        promise: function() {}
    }

    const listObjectsResponse = {
        promise: function() {
            return { NextContinuationToken: undefined, Contents: undefined }
        }
    }
    const listObjectsResponseWithContents = {
        promise: function() {
            return { NextContinuationToken: undefined, Contents: [{ Key: 'test', Value: 'value' }] }
        }
    }
    const listObjectsResponseWithContentsPaginated = {
        returnToken: true,
        promise: function() {
            // tslint:disable-next-line: no-invalid-this
            if (this.returnToken) {
                // tslint:disable-next-line: no-invalid-this
                this.returnToken = false

                return { NextContinuationToken: 'abc', Contents: [{ Key: 'test', Value: 'value' }] }
            } else {
                return { NextContinuationToken: undefined, Contents: [{ Key: 'test2', Value: 'value2' }] }
            }
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

    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/S3Download/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = baseTaskParameters
        expect(new TaskOperations(new S3(), taskParameters)).not.toBeNull()
    })

    test('Handles not being able to connect to a bucket', async () => {
        const s3 = new S3({ region: 'us-east-1' })
        s3.headBucket = jest.fn()((params: any, cb: any) => {
            throw new Error("doesn't exist dummy")
        })
        const taskParameters = baseTaskParameters
        const taskOperation = new TaskOperations(s3, taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch(e => {
            expect(e.message).toContain('not exist')
        })
    })

    test('Deals with null list objects succeeds', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn((params, cb) => headBucketResponse)
        s3.listObjectsV2 = jest.fn((params, cb) => listObjectsResponse)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = directory.name
        taskParameters.bucketName = 'what'
        // required parameter
        taskParameters.globExpressions = []
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute()
    })

    test('Happy path matches all', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn((params, cb) => headBucketResponse)
        s3.listObjectsV2 = jest.fn((params, cb) => listObjectsResponseWithContents)
        s3.getObject = jest.fn((params, cb) => getObjectWithContents)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = directory.name
        taskParameters.bucketName = 'bucket'
        taskParameters.globExpressions = ['*']
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute()
    })

    test('Happy path matches over multiple pages', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn((params, cb) => headBucketResponse)
        s3.listObjectsV2 = jest.fn((params, cb) => listObjectsResponseWithContentsPaginated)
        s3.getObject = jest.fn((params, cb) => getObjectWithContents)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = directory.name
        taskParameters.bucketName = 'bucket'
        taskParameters.globExpressions = ['*']
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute()
    })

    beforeEach(() => {
        // unsafe cleanup so it removes with items in it
        directory = tmp.dirSync({ unsafeCleanup: true })
    })
})
