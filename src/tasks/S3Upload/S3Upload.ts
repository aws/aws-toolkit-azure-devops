/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'

import { SdkUtils } from 'lib/sdkutils'
import { warnIfBuildAgentTooLow } from 'lib/vstsUtils'

import { createDefaultS3 } from 'lib/defaultClients'
import { TaskOperations } from './TaskOperations'
import { buildTaskParameters } from './TaskParameters'

import { getRegion } from 'lib/awsConnectionParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()

    return new TaskOperations(
        await createDefaultS3(taskParameters, tl.debug),
        await getRegion(),
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
