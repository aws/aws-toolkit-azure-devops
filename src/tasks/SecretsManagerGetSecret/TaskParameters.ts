/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    secretIdOrName: string
    variableName: string
    versionId: string
    versionStage: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        secretIdOrName: getInputRequired('secretIdOrName'),
        variableName: getInputRequired('variableName'),
        versionId: getInputOrEmpty('versionId'),
        versionStage: getInputOrEmpty('versionStage')
    }

    return parameters
}
