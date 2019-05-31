/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    functionName: string
    payload: string
    invocationType: string
    logType: string
    outputVariable: string
}

export function buildTaskParameters() {
    const paramters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        functionName: tl.getInput('functionName', true),
        payload: tl.getInput('payload', false),
        invocationType: tl.getInput('invocationType', false),
        logType: tl.getInput('logType', false),
        outputVariable: tl.getInput('outputVariable', false)
    }

    return paramters
}
