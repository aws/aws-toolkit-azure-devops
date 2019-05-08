/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import tl = require('vsts-task-lib/task')

import { SdkUtils } from 'sdkutils/sdkutils'

import { createDefaultS3Client } from 'sdkutilsdefaultClients'
import { buildTaskParameters } from 'Tasks/S3Upload/UploadTaskParameters'
import { TaskOperations } from './UploadTaskOperations'

async function run(): Promise<void> {
    const taskManifestFile = path.join(__dirname, 'task.json')
    tl.setResourcePath(taskManifestFile)
    SdkUtils.setSdkUserAgentFromManifest(taskManifestFile)

    const taskParameters = buildTaskParameters()
    const s3 = await createDefaultS3Client(
        taskParameters.awsConnectionParameters,
        taskParameters.forcePathStyleAddressing,
        tl.debug)

    return new TaskOperations(s3, taskParameters).execute()
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, `${error}`)
)
