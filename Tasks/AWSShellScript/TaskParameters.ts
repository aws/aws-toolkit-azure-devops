/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const inlineScriptType: string = 'inline'
export const fileScriptType: string = 'filePath'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    arguments: string
    scriptType: string
    filePath: string
    inlineScript: string
    disableAutoCwd: boolean
    cwd: string
    failOnStandardError: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        arguments: tl.getInput('arguments', false),
        scriptType: tl.getInput('scriptType', true),
        filePath: undefined,
        inlineScript: undefined,
        disableAutoCwd: tl.getBoolInput('disableAutoCwd', false),
        cwd: undefined,
        failOnStandardError: tl.getBoolInput('failOnStandardError', false)
    }

    if (parameters.scriptType === fileScriptType) {
        parameters.filePath = tl.getPathInput('filePath', true, true)
    } else {
        parameters.inlineScript = tl.getInput('inlineScript', true)
    }

    parameters.cwd = tl.getPathInput('cwd', parameters.disableAutoCwd, false)

    return parameters
}
