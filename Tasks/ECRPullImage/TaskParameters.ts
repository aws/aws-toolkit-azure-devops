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
    imageTag: string
    imageDigest: string
    repository: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        imageSource: tl.getInput('imageSource', true),
        repository: tl.getInput('repository', true),
        imageTag: tl.getInput('imageTag', false),
        imageDigest: tl.getInput('imageDigest', false)
    }

    return parameters
}
