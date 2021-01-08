/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'

export const imageTagSource = 'imagetag'
export const imageIdSource = 'imagedigest'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    imageSource: string
    imageTag: string
    imageDigest: string
    repository: string
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        imageSource: getInputRequired('imageSource'),
        repository: getInputRequired('repository'),
        imageTag: getInputOrEmpty('imageTag'),
        imageDigest: getInputOrEmpty('imageDigest'),
        outputVariable: getInputOrEmpty('outputVariable')
    }

    return parameters
}
