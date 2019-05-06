/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/S3Download/DownloadTaskOperations'
import { TaskParameters } from '../../../Tasks/S3Download/DownloadTaskParameters'
const fs = require('fs')
const AWS = require('aws-sdk')
const ReadableStream = require('stream').Readable

describe('S3 Download', () => {
    const headBucketResponse = {
        promise: function() { }
    }
    const listObjectsResponse = {
        promise: function() {
            return { NextMarker: undefined, Contents: null}
        }
    }
    const listObjectsResponseWithContents = {
        promise: function() {
            return { NextMarker: undefined, Contents: [{Key: "test", Value: "value"}]}
        }
    }
    const getObjectWithContents = {
        createReadStream: function() {
            return new ReadableStream().push('data').push(null)
        }
    }
    const targetFolder: string = './folder'

    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../Tasks/S3Download/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = new TaskParameters()
        expect(new TaskOperations(undefined, taskParameters)).not.toBeNull()
    })

    test('Handles not being able to connect to a bucket', async () => {
        const s3 = new AWS.S3({ region: 'us-east-1' })
        s3.headBucket = jest.fn((params, cb) => { throw new Error('doesn\'t exist dummy') })
        const taskParameters = new TaskParameters()
        const taskOperation = new TaskOperations(s3, taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch((e) => { expect(e.message).toContain('not exist') })
    })

    test('Makes a folder if it does not exist', async () => {
        try {fs.rmdirSync(targetFolder) } catch (e) {}
        const s3 = new AWS.S3({ region: 'us-east-1' })
        const taskParameters = new TaskParameters()
        taskParameters.targetFolder = targetFolder
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute().catch((e) => { /* ignored as this is not required for the test */ })
        fs.access(targetFolder, fs.constants.F_OK, (err) => {
            throw new Error('Failed to create file!\n' + err.message)
        })
    })

    test('Deals with null list objects succeeds', async () => {
        const s3 = new AWS.S3({ region: 'us-east-1' })
        s3.headBucket = jest.fn((params, cb) => headBucketResponse)
        s3.listObjects = jest.fn((params, cb) => listObjectsResponse)
        const taskParameters = new TaskParameters()
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
        const s3 = new AWS.S3({ region: 'us-east-1' })
        s3.headBucket = jest.fn((params, cb) => headBucketResponse)
        s3.listObjects = jest.fn((params, cb) => listObjectsResponseWithContents)
        s3.GetObject = jest.fn((params, cb) => getObjectWithContents)
        const taskParameters = new TaskParameters()
        taskParameters.targetFolder = targetFolder + '2'
        taskParameters.bucketName = 'bucket'
        taskParameters.globExpressions = ['*']
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute().catch((e) => { console.log(e.message)})
    })
})
