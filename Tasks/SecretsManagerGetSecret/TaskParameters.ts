/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    secretIdOrName: string
    variableName: string
    versionId: string | undefined
    versionStage: string | undefined
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        secretIdOrName: tl.getInput('secretIdOrName', true),
        variableName: tl.getInput('variableName', true),
        versionId: tl.getInput('versionId', false),
        versionStage: tl.getInput('versionStage', false)
    }

    return parameters
}
