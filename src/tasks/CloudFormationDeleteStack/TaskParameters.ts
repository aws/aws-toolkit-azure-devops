/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'src/lib/awsConnectionParameters'
import { getInputRequired } from 'src/lib/vstsUtils'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    stackName: string
}

export function buildTaskParameters() {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        stackName: getInputRequired('stackName')
    }

    return parameters
}
