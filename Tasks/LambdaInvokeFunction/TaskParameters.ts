/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    functionName: string
    payload: string
    invocationType: string
    logType: string
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    return {
        awsConnectionParameters: buildConnectionParameters(),
        functionName: getInputRequired('functionName'),
        payload: getInputOrEmpty('payload'),
        invocationType: getInputOrEmpty('invocationType'),
        logType: getInputOrEmpty('logType'),
        outputVariable: getInputOrEmpty('outputVariable')
    }
}
