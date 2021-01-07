/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'src/lib/awsConnectionParameters'
import { readModeHierarchy, readModeSingle } from 'src/lib/ssm'
import { getInputOptional, getInputOrEmpty, getInputRequired } from 'src/lib/vstsUtils'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    readMode: string
    parameterName: string
    parameterVersion: number | undefined
    parameterPath: string
    recursive: boolean
    variableNameTransform: string
    customVariableName: string
    replacementPattern: string
    replacementText: string
    globalMatch: boolean
    caseInsensitiveMatch: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        readMode: getInputRequired('readMode'),
        parameterName: '',
        parameterVersion: undefined,
        parameterPath: '',
        recursive: false,
        variableNameTransform: '',
        customVariableName: '',
        replacementPattern: '',
        replacementText: '',
        globalMatch: false,
        caseInsensitiveMatch: false
    }

    switch (parameters.readMode) {
        case readModeSingle:
            parameters.parameterName = getInputRequired('parameterName')
            const versionstring = getInputOptional('parameterVersion')
            if (versionstring) {
                const pv = parseInt(versionstring, 10)
                if (!isNaN(pv) && pv > 0) {
                    parameters.parameterVersion = pv
                } else {
                    throw new Error(tl.loc('InvalidParameterVersion', pv))
                }
            }
            parameters.variableNameTransform = getInputOrEmpty('singleNameTransform')
            break
        case readModeHierarchy:
            parameters.parameterPath = getInputRequired('parameterPath')
            parameters.recursive = tl.getBoolInput('recursive', false)
            parameters.variableNameTransform = getInputOrEmpty('hierarchyNameTransform')
            break
        default:
            throw new Error(tl.loc('UnknownReadMode', parameters.readMode))
    }

    switch (parameters.variableNameTransform) {
        case 'substitute':
            parameters.replacementPattern = getInputRequired('replacementPattern')
            parameters.replacementText = getInputOrEmpty('replacementText')
            parameters.globalMatch = tl.getBoolInput('globalMatch', false)
            parameters.caseInsensitiveMatch = tl.getBoolInput('caseInsensitiveMatch', false)
            break

        case 'custom':
            parameters.customVariableName = getInputRequired('customVariableName')
            break

        default:
            break
    }

    return parameters
}
