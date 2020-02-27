/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getBoolInput } from 'azure-pipelines-task-lib'
import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputRequired } from 'Common/vstsUtils'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    stackName: string
    deleteUpdateInProgress: boolean | undefined
}

export function buildTaskParameters() {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        stackName: getInputRequired('stackName'),
        deleteUpdateInProgress: getBoolInput('deleteUpdateInProgress', false)
    }

    return parameters
}
