/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('vsts-task-lib/task')

import { SdkUtils } from 'sdkutils/sdkutils'

import { createDefaultSecretsManager } from 'Common/defaultClients'
import { TaskOperations } from './GetSecretTaskOperations'
import { buildTaskParameters } from './GetSecretTaskParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()
    const secretsManager = await createDefaultSecretsManager(taskParameters.awsConnectionParameters, tl.debug)

    return new TaskOperations(secretsManager, taskParameters).execute()
}

run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, `${error}`)
)
