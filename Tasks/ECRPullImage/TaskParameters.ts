/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const imageNameSource: string = 'imagename'
export const imageIdSource: string = 'imageid'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    imageSource: string
    targetImageName: string
    targetImageTag: string
    targetImageId: string
    repositoryName: string
    autoCreateRepository: boolean
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        imageSource: tl.getInput('imageSource', true),
        repositoryName: tl.getInput('repositoryName', true),
        autoCreateRepository: tl.getBoolInput('autoCreateRepository', false),
        outputVariable: tl.getInput('outputVariable', false),
        targetImageName: undefined,
        targetImageId: undefined,
        targetImageTag: undefined
    }

    if (parameters.imageSource === imageNameSource) {
        parameters.targetImageName = tl.getInput('targetImageName', true)
        parameters.targetImageTag = tl.getInput('targetImageTag', false)
        if (!parameters.targetImageTag) {
            parameters.targetImageTag = 'latest'
        }
    } else {
        parameters.targetImageId = tl.getInput('targetImageId', true)
    }

    return parameters
}
