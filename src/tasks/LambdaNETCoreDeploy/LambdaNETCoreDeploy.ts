/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'

import { SdkUtils } from 'lib/sdkutils'
import { warnIfBuildAgentTooLow } from 'lib/vstsUtils'

import { TaskOperations } from './TaskOperations'
import { buildTaskParameters } from './TaskParameters'

import { getCredentials } from 'lib/awsConnectionParameters'

async function run(): Promise<void> {
    SdkUtils.readResources()
    process.env.AWS_EXECUTION_ENV = 'VSTS-LambdaNETCoreDeploy'
    const taskParameters = buildTaskParameters()

    return new TaskOperations(
        await getCredentials(taskParameters.awsConnectionParameters),
        tl.which('dotnet', true),
        'dotnet-lambda',
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
