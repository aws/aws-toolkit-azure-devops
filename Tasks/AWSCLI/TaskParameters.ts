/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

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
        awsCliCommand: tl.getInput('awsCommand', true),
        awsCliSubCommand: tl.getInput('awsSubCommand', true),
        awsCliParameters: tl.getInput('awsArguments', false),
        failOnStandardError: tl.getBoolInput('failOnStandardError')
    }

    return parameters
}
