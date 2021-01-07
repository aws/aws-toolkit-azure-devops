/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'

export const simpleStringType = 'String'
export const stringListType = 'StringList'
export const secureStringType = 'SecureString'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    parameterName: string
    parameterType: string
    parameterValue: string
    encryptionKeyId: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        parameterName: getInputRequired('parameterName'),
        parameterType: getInputRequired('parameterType'),
        parameterValue: getInputRequired('parameterValue'),
        encryptionKeyId: ''
    }

    if (parameters.parameterType === secureStringType) {
        parameters.encryptionKeyId = getInputOrEmpty('encryptionKeyId')
    }

    return parameters
}
