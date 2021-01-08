/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    messageTarget: string
    message: string
    topicArn: string
    queueUrl: string
    delaySeconds: number | undefined
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        messageTarget: getInputRequired('messageTarget'),
        message: getInputRequired('message'),
        topicArn: '',
        queueUrl: '',
        delaySeconds: undefined
    }
    if (parameters.messageTarget === 'topic') {
        parameters.topicArn = getInputRequired('topicArn')
    } else {
        parameters.queueUrl = getInputRequired('queueUrl')
        const delay = getInputOrEmpty('delaySeconds')
        if (delay) {
            const parsedInt = parseInt(delay, 10)
            if (!isNaN(parsedInt)) {
                parameters.delaySeconds = parsedInt
            }
        }
    }

    return parameters
}
