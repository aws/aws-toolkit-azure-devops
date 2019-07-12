/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'
import * as tl from 'vsts-task-lib/task'

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
        arguments: getInputOrEmpty('arguments'),
        scriptType: getInputRequired('scriptType'),
        filePath: '',
        inlineScript: '',
        disableAutoCwd: tl.getBoolInput('disableAutoCwd', false),
        workingDirectory: '',
        failOnStandardError: tl.getBoolInput('failOnStandardError', false)
    }

    if (parameters.scriptType === fileScriptType) {
        parameters.filePath = tl.getPathInput('filePath', true, true)
    } else {
        parameters.inlineScript = getInputRequired('inlineScript')
    }

    if (parameters.disableAutoCwd) {
        parameters.workingDirectory = tl.getPathInput('workingDirectory', true, false)
    }

    return parameters
}
