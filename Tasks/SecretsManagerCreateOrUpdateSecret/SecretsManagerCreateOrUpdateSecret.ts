/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import tl = require('vsts-task-lib/task')

import { SdkUtils } from 'sdkutils/sdkutils'

import { TaskOperations } from './CreateOrUpdateSecretTaskOperations'
import { TaskParameters } from './CreateOrUpdateSecretTaskParameters'

async function run(): Promise<void> {
    const taskManifestFile = path.join(__dirname, 'task.json')
    tl.setResourcePath(taskManifestFile)
    SdkUtils.setSdkUserAgentFromManifest(taskManifestFile)

    const taskParameters = new TaskParameters()

    return new TaskOperations(taskParameters).execute()
}

run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, `${error}`)
)
