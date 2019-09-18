/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('azure-pipelines-task-lib/task')
import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

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
        imageSource: getInputRequired('imageSource'),
        repositoryName: getInputRequired('repositoryName'),
        pushTag: getInputOrEmpty('pushTag'),
        autoCreateRepository: tl.getBoolInput('autoCreateRepository', false),
        outputVariable: getInputOrEmpty('outputVariable'),
        sourceImageName: '',
        sourceImageId: '',
        sourceImageTag: ''
    }

    if (parameters.imageSource === imageNameSource) {
        parameters.sourceImageName = getInputRequired('sourceImageName')
        parameters.sourceImageTag = getInputOrEmpty('sourceImageTag')
        if (!parameters.sourceImageTag) {
            parameters.sourceImageTag = 'latest'
        }
    } else {
        parameters.sourceImageId = getInputRequired('sourceImageId')
    }

    return parameters
}
