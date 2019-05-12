/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('vsts-task-lib/task')

import { createDefaultS3 } from 'Common/defaultClients'
import { SdkUtils } from 'sdkutils/sdkutils'

import { TaskOperations } from './DownloadTaskOperations'
import { buildTaskParameters } from './DownloadTaskParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()
    const s3 = await createDefaultS3(taskParameters, tl.debug)

    return new TaskOperations(s3, taskParameters).execute()
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, `${error}`)
)
