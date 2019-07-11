/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const imageTagSource: string = 'imagetag'
export const imageIdSource: string = 'imagedigest'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    imageSource: string
    targetImageTag: string
    targetImageDigest: string
    repositoryName: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        imageSource: tl.getInput('imageSource', true),
        repositoryName: tl.getInput('repositoryName', true),
        targetImageTag: tl.getInput('targetImageTag', false),
        targetImageDigest: tl.getInput('targetImageTag', false)
    }

    return parameters
}
