/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
    workingDirectory: string
    failOnStandardError: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        arguments: tl.getInput('arguments', false),
        scriptType: tl.getInput('scriptType', true),
        filePath: '',
        inlineScript: '',
        disableAutoCwd: tl.getBoolInput('disableAutoCwd', false),
        workingDirectory: '',
        failOnStandardError: tl.getBoolInput('failOnStandardError', false)
    }

    if (parameters.scriptType === fileScriptType) {
        parameters.filePath = tl.getPathInput('filePath', true, true)
    } else {
        parameters.inlineScript = tl.getInput('inlineScript', true)
    }

    if (parameters.disableAutoCwd) {
        parameters.workingDirectory = tl.getPathInput('workingDirectory', true, false)
    }

    return parameters
}
