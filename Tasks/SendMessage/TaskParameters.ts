/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    messageTarget: string
    message: string
    topicArn: string
    queueUrl: string
    delaySeconds: number
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        messageTarget: tl.getInput('messageTarget', true),
        message: tl.getInput('message', true),
        topicArn: undefined,
        queueUrl: undefined,
        delaySeconds: undefined
    }
    if (parameters.messageTarget === 'topic') {
        parameters.topicArn = tl.getInput('topicArn', true)
    } else {
        parameters.queueUrl = tl.getInput('queueUrl', true)
        const delay = tl.getInput('delaySeconds', false)
        if (delay) {
            parameters.delaySeconds = parseInt(delay, 10)
        }
    }

    return parameters
}
