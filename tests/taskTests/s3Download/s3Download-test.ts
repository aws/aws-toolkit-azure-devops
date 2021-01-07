/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3 } from 'aws-sdk'
import { SdkUtils } from 'lib/sdkutils'
import { Readable as ReadableStream } from 'stream'
import * as tmp from 'tmp'
import { TaskOperations } from 'tasks/S3Download/TaskOperations'
import { TaskParameters } from 'tasks/S3Download/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

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
            // MUST be null or else it will not stop reading
            // eslint-disable-next-line no-null/no-null
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
        s3.headBucket = jest.fn()(() => {
            throw new Error("doesn't exist dummy")
        })
        const taskOperation = new TaskOperations(s3, baseTaskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch(e => {
            expect(e.message).toContain('not exist')
        })
    })

    test('Deals with null list objects succeeds', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.listObjectsV2 = jest.fn(() => listObjectsResponse)
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
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.listObjectsV2 = jest.fn(() => listObjectsResponseWithContents)
        s3.getObject = jest.fn(() => getObjectWithContents)
        const taskParameters = baseTaskParameters
        taskParameters.targetFolder = directory.name
        taskParameters.bucketName = 'bucket'
        taskParameters.globExpressions = ['*']
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute()
    })

    test('Happy path matches over multiple pages', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.listObjectsV2 = jest.fn(() => listObjectsResponseWithContentsPaginated)
        s3.getObject = jest.fn(() => getObjectWithContents)
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
