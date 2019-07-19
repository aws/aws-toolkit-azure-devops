/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3 } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/S3Upload/TaskOperations'
import { TaskParameters } from '../../../Tasks/S3Upload/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    bucketName: '',
    sourceFolder: '',
    targetFolder: '',
    flattenFolders: false,
    overwrite: false,
    globExpressions: [],
    filesAcl: '',
    createBucket: false,
    contentType: '',
    contentEncoding: '',
    forcePathStyleAddressing: false,
    storageClass: '',
    keyManagement: '',
    encryptionAlgorithm: '',
    kmsMasterKeyId: '',
    customerKey: Buffer.from([]),
    cacheControl: []
}

const headBucketResponse = {
    promise: function() {}
}

const headBucketResponseFails = {
    promise: function() {
        throw new Error("doesn't exist")
    }
}

const createBucketResponse = {
    promise: function() {
        throw new Error('create called')
    }
}

const validateUpload = {
    promise: function() {
        return undefined
    }
}

describe('S3 Upload', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/S3Upload/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = baseTaskParameters
        expect(new TaskOperations(new S3(), '', taskParameters)).not.toBeNull()
    })

    test('Handles bucket not existing (and not being able to create one)', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn()(() => headBucketResponseFails)
        const taskParameters = baseTaskParameters
        const taskOperation = new TaskOperations(s3, '', taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch(e => {
            expect(e.message).toContain('not exist')
        })
    })

    test('Tries and fails to create bucket when told to', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponseFails)
        s3.createBucket = jest.fn(() => createBucketResponse)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.createBucket = true
        taskParameters.bucketName = 'potato'
        const taskOperation = new TaskOperations(s3, '', taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch(e => {
            expect(e.message).toContain('create called')
        })
    })

    test('Finds matching files', () => {
        const s3 = new S3({ region: 'us-east-1' })
        const taskParameters = { ...baseTaskParameters }
        taskParameters.bucketName = 'potato'
        taskParameters.sourceFolder = __dirname
        taskParameters.globExpressions = ['*.ts']
        const taskOperation = new TaskOperations(s3, '', taskParameters)
        const results = taskOperation.findMatchingFiles(taskParameters)
        // expect it to find this file only
        expect(results.length).toBe(1)
    })

    test('No matching files found', async () => {
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.upload = jest.fn((params: S3.PutObjectRequest) => {
            throw new Error('should not be called')
        })
        const taskParameters = { ...baseTaskParameters }
        taskParameters.createBucket = true
        taskParameters.sourceFolder = __dirname
        taskParameters.globExpressions = ['*.js']
        const taskOperation = new TaskOperations(s3, '', taskParameters)
        await taskOperation.execute()
    })

    test('Happy path uploads a found file', async () => {
        expect.assertions(5)
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.upload = jest.fn((params: S3.PutObjectRequest) => {
            expect(params.Bucket).toBe('potato')
            expect(params.Key).toContain('ts')
            expect(params.ContentEncoding).toBe('gzip')
            expect(params.ContentType).toBe('application/json')

            return validateUpload
        })
        const taskParameters = { ...baseTaskParameters }
        taskParameters.createBucket = true
        taskParameters.bucketName = 'potato'
        taskParameters.sourceFolder = __dirname
        taskParameters.globExpressions = ['*.ts']
        taskParameters.contentEncoding = 'gzip'
        taskParameters.contentType = 'application/json'
        const taskOperation = new TaskOperations(s3, '', taskParameters)
        await taskOperation.execute()
        expect(s3.upload.mock.calls.length).toBe(1)
    })

    test('Cache control works', async () => {
        expect.assertions(1)
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.upload = jest.fn((params: S3.PutObjectRequest) => {
            expect(params.CacheControl).toBe('public')

            return validateUpload
        })
        const taskParameters = { ...baseTaskParameters }
        taskParameters.createBucket = true
        taskParameters.sourceFolder = __dirname
        taskParameters.globExpressions = ['*.ts']
        taskParameters.cacheControl = ['*.ts=public']
        const taskOperation = new TaskOperations(s3, '', taskParameters)
        await taskOperation.execute()
    })

    test("Cache control doesn't match", async () => {
        expect.assertions(1)
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.upload = jest.fn((params: S3.PutObjectRequest) => {
            expect(params.CacheControl).toBeUndefined()

            return validateUpload
        })
        const taskParameters = { ...baseTaskParameters }
        taskParameters.createBucket = true
        taskParameters.sourceFolder = __dirname
        taskParameters.globExpressions = ['*.ts']
        taskParameters.cacheControl = ['*.js=public']
        const taskOperation = new TaskOperations(s3, '', taskParameters)
        await taskOperation.execute()
    })

    test('Cache control invalid expression fails', async () => {
        expect.assertions(2)
        const s3 = new S3({ region: 'us-east-1' }) as any
        s3.headBucket = jest.fn(() => headBucketResponse)
        s3.upload = jest.fn(() => validateUpload)
        const taskParameters = { ...baseTaskParameters }
        taskParameters.createBucket = true
        taskParameters.sourceFolder = __dirname
        taskParameters.globExpressions = ['*.ts']
        taskParameters.cacheControl = ['*.js=']
        let taskOperation = new TaskOperations(s3, '', taskParameters)
        await taskOperation.execute().catch(e => {
            expect(e.message).toContain('Invalid match expression *.js=')
        })
        taskParameters.cacheControl = ['=false']
        taskOperation = new TaskOperations(s3, '', taskParameters)
        await taskOperation.execute().catch(e => {
            expect(e.message).toContain('Invalid match expression =false')
        })
    })
})
