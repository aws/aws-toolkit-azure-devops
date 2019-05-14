/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('vsts-task-lib/task')

export const transformCustom = 'custom'
export const transformSubstitute = 'substitute'
export const readModeSingle = 'single'

// Transforms the read parameter name depending on task settings. If the task was set
// to read a single parameter, the input parameter name is in the task parameters. When
// reading a hierarchy, we pass in the individual parameter name from the collection
// read by the task.
export function transformParameterToVariableName(
    inputParameterName: string,
    taskParameters: {
        parameterName: string,
        variableNameTransform: string,
        globalMatch: boolean,
        caseInsensitiveMatch: boolean,
        replacementPattern: string,
        replacementText: string,
        customVariableName: string}): string {

    if (!inputParameterName) {
        inputParameterName = taskParameters.parameterName
    }

    let outputVariableName: string
    switch (taskParameters.variableNameTransform) {
        case 'none':
            outputVariableName = inputParameterName
            break

        case 'leaf':
            const parts = inputParameterName.split(/\//)
            // if the name ended in /, walk backwards
            for (let i: number = parts.length - 1; i > 0; i--) {
                if (parts[i]) {
                    outputVariableName = parts[i]
                    break
                }
            }

            if (!outputVariableName) {
                throw new Error(
                    `Failed to determine leaf component of parameter name ${taskParameters.parameterName}`)
            }
            break

        case 'substitute':
            let flags: string = ''
            if (taskParameters.globalMatch) {
                flags += 'g'
            }
            if (taskParameters.caseInsensitiveMatch) {
                flags += 'i'
            }
            const pattern = new RegExp(taskParameters.replacementPattern, flags)
            outputVariableName = inputParameterName.replace(pattern, taskParameters.replacementText)
            break

        // note this mode is only applicable to single name parameter reads
        case 'custom':
            outputVariableName = taskParameters.customVariableName
            break

        default:
            throw new Error(`Unknown name transform mode ${taskParameters.variableNameTransform}`)
    }

    if (taskParameters.variableNameTransform === 'none') {
        console.log(tl.loc('UsingParameterNameForVariable', inputParameterName))
    } else {
        console.log(tl.loc('TransformedParameterName', inputParameterName, outputVariableName))
    }

    return outputVariableName
}
