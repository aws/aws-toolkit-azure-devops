/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('azure-pipelines-task-lib/task')
import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'

export const imageNameSource = 'imagename'
export const imageIdSource = 'imageid'
export const retagSource = 'retag'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    imageSource: string
    sourceImageName: string
    sourceImageTag: string
    sourceImageId: string
    repositoryName: string
    targetTag: string
    newTag: string
    autoCreateRepository: boolean
    forceDockerNamingConventions: boolean
    removeDockerImage: boolean
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        imageSource: getInputRequired('imageSource'),
        repositoryName: getInputRequired('repositoryName'),
        targetTag: getInputOrEmpty('targetTag'),
        autoCreateRepository: tl.getBoolInput('autoCreateRepository', false),
        forceDockerNamingConventions: tl.getBoolInput('forceDockerNamingConventions', false),
        removeDockerImage: tl.getBoolInput('removeDockerImage', false),
        outputVariable: getInputOrEmpty('outputVariable'),
        sourceImageName: '',
        sourceImageId: '',
        sourceImageTag: '',
        newTag: ''
    }

    switch (parameters.imageSource) {
        case imageNameSource:
            parameters.sourceImageName = getInputRequired('sourceImageName')
            parameters.sourceImageTag = getInputOrEmpty('sourceImageTag')
            if (!parameters.sourceImageTag) {
                parameters.sourceImageTag = 'latest'
            }
            break
        case imageIdSource:
            parameters.sourceImageId = getInputRequired('sourceImageId')
            break
        case retagSource:
            parameters.newTag = getInputRequired('newTag')
            break
        default:
            throw new Error(`Unknown imageSource specified: ${parameters.imageSource}`)
    }

    if (!parameters.targetTag) {
        parameters.targetTag = 'latest'
    }

    return parameters
}
