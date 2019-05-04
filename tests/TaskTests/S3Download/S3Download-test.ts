/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/S3Download/DownloadTaskOperations'
import { TaskParameters } from '../../../Tasks/S3Download/DownloadTaskParameters'
const fs = require('fs')
const AWS = require('aws-sdk')

describe('S3 Download', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../Tasks/S3Download/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = new TaskParameters()
        expect(new TaskOperations(null, taskParameters)).not.toBeNull()
    })

    test('Handles not being able to connect to a bucket', async () => {
        const s3 = new AWS.S3({region: 'us-east-1'})
        s3.headBucket = jest.fn((params, cb) => {throw new Error('doesn\'t exist dummy') })
        const taskParameters = new TaskParameters()
        const taskOperation = new TaskOperations(s3, taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch((e) => { expect(e.message).toContain('not exist') })
    })

    test('Makes a folder if it does not exist', async () => {
        const targetFolder: string = './folder'
        fs.rmdir(targetFolder, (err) => {})
        const s3 = new AWS.S3({region: 'us-east-1'})
        s3.headBucket = jest.fn((params, cb) => { })
        const taskParameters = new TaskParameters()
        taskParameters.targetFolder = targetFolder
        const taskOperation = new TaskOperations(s3, taskParameters)
        await taskOperation.execute().catch((e) => { /* ignored as this is not required for the test */})
        fs.access(targetFolder, fs.constants.F_OK, (err) => {
            throw new Error('Failed to create file!')
        })
        console.log('successfully created folder')
    })
})
