/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('azure-pipelines-task-lib/task')
import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export const imageTagSource: string = 'imagetag'
export const imageIdSource: string = 'imagedigest'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    imageSource: string
    imageTag: string
    imageDigest: string
    repository: string
    outputVariable: string
    dockerLogin: boolean
    dockerLogout: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        imageSource: getInputRequired('imageSource'),
        repository: getInputRequired('repository'),
        imageTag: getInputOrEmpty('imageTag'),
        imageDigest: getInputOrEmpty('imageDigest'),
        outputVariable: getInputOrEmpty('outputVariable'),
        dockerLogin: tl.getBoolInput('dockerLogin'),
        dockerLogout: tl.getBoolInput('dockerLogout')
    }

    return parameters
}
