/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const ignoreStackOutputs: string = 'ignore'
export const stackOutputsAsVariables: string = 'asVariables'
export const stackOutputsAsJson: string = 'asJSON'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    changeSetName: string
    stackName: string
    outputVariable: string
    captureStackOutputs: string
    captureAsSecuredVars: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        changeSetName: tl.getInput('changeSetName', true),
        stackName: tl.getInput('stackName', true),
        outputVariable: tl.getInput('outputVariable', false),
        captureStackOutputs: tl.getInput('captureStackOutputs', false),
        captureAsSecuredVars: tl.getBoolInput('captureAsSecuredVars', false)
    }

    return parameters
}
