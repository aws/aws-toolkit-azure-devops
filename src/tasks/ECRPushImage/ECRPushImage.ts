/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'

import { SdkUtils } from 'lib/sdkutils'
import { warnIfBuildAgentTooLow } from 'lib/vstsUtils'

import { createDefaultECR } from 'lib/defaultClients'
import { TaskOperations } from './TaskOperations'
import { buildTaskParameters } from './TaskParameters'

import { locateDockerExecutable, runDockerCommand } from 'lib/dockerUtils'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()

    return new TaskOperations(
        await createDefaultECR(taskParameters, tl.debug),
        { runDockerCommand: runDockerCommand, locateDockerExecutable: locateDockerExecutable },
        taskParameters
    ).execute()
}

run()
    .then(result => {
        const tooLow = warnIfBuildAgentTooLow()
        tl.setResult(tooLow ? tl.TaskResult.SucceededWithIssues : tl.TaskResult.Succeeded, '')
    })
    .catch(error => {
        tl.setResult(tl.TaskResult.Failed, `${error}`)
    })
