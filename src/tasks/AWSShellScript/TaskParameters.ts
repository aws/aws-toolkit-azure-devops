/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getBoolInput } from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired, getPathInputRequired, getPathInputRequiredCheck } from 'lib/vstsUtils'

export const inlineScriptType = 'inline'
export const fileScriptType = 'filePath'

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
        disableAutoCwd: getBoolInput('disableAutoCwd', false),
        workingDirectory: '',
        failOnStandardError: getBoolInput('failOnStandardError', false)
    }

    if (parameters.scriptType === fileScriptType) {
        parameters.filePath = getPathInputRequiredCheck('filePath')
    } else {
        parameters.inlineScript = getInputRequired('inlineScript')
    }

    if (parameters.disableAutoCwd) {
        parameters.workingDirectory = getPathInputRequired('workingDirectory')
    }

    return parameters
}
