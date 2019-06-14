/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { readModeHierarchy, readModeSingle } from 'Common/ssm'
import tl = require('vsts-task-lib/task')

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    readMode: string
    parameterName: string
    parameterVersion: number | undefined
    parameterPath: string
    recursive: boolean | undefined
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
        readMode: tl.getInput('readMode', true),
        parameterName: '',
        parameterVersion: undefined,
        parameterPath: '',
        recursive: undefined,
        variableNameTransform: '',
        customVariableName: '',
        replacementPattern: '',
        replacementText: '',
        globalMatch: false,
        caseInsensitiveMatch: false
    }

    switch (parameters.readMode) {
        case readModeSingle:
            parameters.parameterName = tl.getInput('parameterName', true)
            const versionstring = tl.getInput('parameterVersion', false)
            if (versionstring) {
                const pv = parseInt(versionstring, 10)
                if (pv > 0) {
                    parameters.parameterVersion = pv
                } else {
                    throw new Error(tl.loc('InvalidParameterVersion', pv))
                }
            }
            parameters.variableNameTransform = tl.getInput('singleNameTransform', false)
            break
        case readModeHierarchy:
            parameters.parameterPath = tl.getInput('parameterPath', true)
            parameters.recursive = tl.getBoolInput('recursive', false)
            parameters.variableNameTransform = tl.getInput('hierarchyNameTransform', false)
            break
        default:
            throw new Error(tl.loc('UnknownReadMode', parameters.readMode))
    }

    switch (parameters.variableNameTransform) {
        case 'substitute':
            parameters.replacementPattern = tl.getInput('replacementPattern', true)
            parameters.replacementText = tl.getInput('replacementText', false) || ''
            parameters.globalMatch = tl.getBoolInput('globalMatch', false) || false
            parameters.caseInsensitiveMatch = tl.getBoolInput('caseInsensitiveMatch', false)
            break

        case 'custom':
            parameters.customVariableName = tl.getInput('customVariableName', true)
            break

        default:
            break
    }

    return parameters
}
