/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import tl = require('vsts-task-lib/task')

import { SdkUtils } from 'sdkutils/sdkutils'

import { TaskOperations } from './GetSecretTaskOperations'
import { TaskParameters } from './GetSecretTaskParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = new TaskParameters()

    return new TaskOperations(taskParameters).execute()
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, `${error}`)
)
