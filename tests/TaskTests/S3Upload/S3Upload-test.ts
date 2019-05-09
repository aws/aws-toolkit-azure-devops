/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3 } from 'aws-sdk'
import * as fs from 'fs'
import { Readable as ReadableStream } from 'stream'
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/S3Upload/UploadTaskOperations'
import { TaskParameters } from '../../../Tasks/S3Upload/UploadTaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

describe('S3 Download', () => {
    const baseTaskParameters: TaskParameters = {
        awsConnectionParameters: undefined,
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
        customerKey: Buffer.from([])
    }

    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/S3Upload/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = baseTaskParameters
        expect(new TaskOperations(new S3(), taskParameters)).not.toBeNull()
    })

    test('Handles not being able to create a bucket', async () => {
        const s3 = new S3({ region: 'us-east-1' })
        s3.headBucket = jest.fn()((params: any, cb: any) => { throw new Error('doesn\'t exist dummy') })
        const taskParameters = baseTaskParameters
        const taskOperation = new TaskOperations(s3, taskParameters)
        expect.assertions(1)
        await taskOperation.execute().catch((e) => { expect(e.message).toContain('not exist') })
    })
})
