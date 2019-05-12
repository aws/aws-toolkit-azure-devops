/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('vsts-task-lib/task')

import { SdkUtils } from 'sdkutils/sdkutils'

import { getRegion } from 'Common/awsConnectionParameters'
import { createDefaultS3Client } from 'Common/defaultClients'
import { TaskOperations } from './UploadTaskOperations'
import { buildTaskParameters } from './UploadTaskParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()
    const s3 = await createDefaultS3Client(taskParameters, tl.debug)
    const region = await getRegion()

    return new TaskOperations(s3, region, taskParameters).execute()
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, `${error}`)
)
