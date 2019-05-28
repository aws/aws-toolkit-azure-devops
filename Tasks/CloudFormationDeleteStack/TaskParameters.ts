/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    stackName: string
}

export function buildTaskParameters() {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        stackName: tl.getInput('stackName', true)
    }

    return parameters
}
