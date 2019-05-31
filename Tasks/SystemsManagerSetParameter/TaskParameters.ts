/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const simpleStringType: string = 'String'
export const stringListType: string = 'StringList'
export const secureStringType: string = 'SecureString'

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
        parameterName: tl.getInput('parameterName', true),
        parameterType: tl.getInput('parameterType', true),
        parameterValue: tl.getInput('parameterValue', true),
        encryptionKeyId: undefined
    }

    if (parameters.parameterType === secureStringType) {
        parameters.encryptionKeyId = tl.getInput('encryptionKeyId', false)
    }

    return parameters
}
