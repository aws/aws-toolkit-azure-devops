/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getBoolInput } from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const ignoreStackOutputs = 'ignore'
export const stackOutputsAsVariables = 'asVariables'
export const stackOutputsAsJson = 'asJSON'

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
        changeSetName: getInputRequired('changeSetName'),
        stackName: getInputRequired('stackName'),
        outputVariable: getInputOrEmpty('outputVariable'),
        captureStackOutputs: getInputOrEmpty('captureStackOutputs'),
        captureAsSecuredVars: getBoolInput('captureAsSecuredVars', false)
    }

    return parameters
}
