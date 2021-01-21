/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'

import { SdkUtils } from 'lib/sdkutils'
import { warnIfBuildAgentTooLow } from 'lib/vstsUtils'

import { createDefaultBeanstalk, createDefaultS3 } from 'lib/defaultClients'
import { TaskOperations } from './TaskOperations'
import { buildTaskParameters } from './TaskParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()

    return new TaskOperations(
        await createDefaultBeanstalk(taskParameters, tl.debug),
        await createDefaultS3(taskParameters, tl.debug),
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
