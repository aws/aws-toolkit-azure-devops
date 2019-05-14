/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const transformCustom = 'custom'
export const transformSubstitute = 'substitute'
export const readModeSingle = 'single'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters,
    readMode: string,
    parameterName: string,
    parameterVersion: number,
    parameterPath: string,
    recursive: boolean,
    variableNameTransform: string,
    customVariableName: string,
    replacementPattern: string,
    replacementText: string,
    globalMatch: boolean,
    caseInsensitiveMatch: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        readMode: tl.getInput('readMode', true),
        parameterName: undefined,
        parameterVersion: undefined,
        parameterPath: undefined,
        recursive: undefined,
        variableNameTransform: undefined,
        customVariableName: undefined,
        replacementPattern: undefined,
        replacementText: undefined,
        globalMatch: undefined,
        caseInsensitiveMatch: undefined
    }

    if (parameters.readMode === readModeSingle) {
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
    } else {
        parameters.parameterPath = tl.getInput('parameterPath', true)
        parameters.recursive = tl.getBoolInput('recursive', false)
        parameters.variableNameTransform = tl.getInput('hierarchyNameTransform', false)
    }

    switch (parameters.variableNameTransform) {
        case 'substitute':
            parameters.replacementPattern = tl.getInput('replacementPattern', true)
            parameters.replacementText = tl.getInput('replacementText', false) || ''
            parameters.globalMatch = tl.getBoolInput('globalMatch', false)
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
