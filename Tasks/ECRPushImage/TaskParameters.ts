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
    sourceImageName: string
    sourceImageTag: string
    sourceImageId: string
    repositoryName: string
    pushTag: string
    autoCreateRepository: boolean
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        imageSource: tl.getInput('imageSource', true),
        repositoryName: tl.getInput('repositoryName', true),
        pushTag: tl.getInput('pushTag', false),
        autoCreateRepository: tl.getBoolInput('autoCreateRepository', false),
        outputVariable: tl.getInput('outputVariable', false),
        sourceImageName: '',
        sourceImageId: '',
        sourceImageTag: ''
    }

    if (parameters.imageSource === imageNameSource) {
        parameters.sourceImageName = tl.getInput('sourceImageName', true)
        parameters.sourceImageTag = tl.getInput('sourceImageTag', false)
        if (!parameters.sourceImageTag) {
            parameters.sourceImageTag = 'latest'
        }
    } else {
        parameters.sourceImageId = tl.getInput('sourceImageId', true)
    }

    return parameters
}
