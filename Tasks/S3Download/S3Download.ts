/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('vsts-task-lib/task')

import { createDefaultS3Client } from 'sdkutils/defaultClients'
import { SdkUtils } from 'sdkutils/sdkutils'

import { TaskOperations } from './DownloadTaskOperations'
import { TaskParameters } from './DownloadTaskParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = TaskParameters.build()
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
    tl.setResult(tl.TaskResult.Failed, error)
)
