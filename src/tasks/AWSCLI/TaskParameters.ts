/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'src/lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'src/lib/vstsUtils'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    awsCliCommand: string
    awsCliSubCommand: string
    awsCliParameters: string
    failOnStandardError: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        awsCliCommand: getInputRequired('awsCommand'),
        awsCliSubCommand: getInputRequired('awsSubCommand'),
        awsCliParameters: getInputOrEmpty('awsArguments'),
        failOnStandardError: tl.getBoolInput('failOnStandardError')
    }

    return parameters
}
