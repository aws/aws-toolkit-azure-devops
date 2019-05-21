/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const fromInstanceIds: string = 'fromInstanceIds'
export const fromTags: string = 'fromTags'
export const fromBuildVariable: string = 'fromBuildVariable'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    documentName: string
    documentParameters: string
    serviceRoleARN: string
    comment: string
    instanceSelector: string
    instanceIds: string[]
    instanceTags: string[]
    instanceBuildVariable: string
    maxConcurrency: string
    maxErrors: string
    timeout: string
    notificationArn: string
    notificationEvents: string
    notificationType: string
    outputS3BucketName: string
    outputS3KeyPrefix: string
    commandIdOutputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        documentName: tl.getInput('documentName', true),
        documentParameters: tl.getInput('documentParameters', false),
        serviceRoleARN: tl.getInput('serviceRoleARN', false),
        comment: tl.getInput('comment', false),
        instanceSelector: tl.getInput('instanceSelector', true),
        maxConcurrency: tl.getInput('maxConcurrency', false),
        maxErrors: tl.getInput('maxErrors', false),
        timeout: tl.getInput('timeout', false),
        notificationArn: tl.getInput('notificationArn', false),
        notificationEvents: tl.getInput('notificationEvents', false),
        notificationType: tl.getInput('notificationType', false),
        outputS3BucketName: tl.getInput('outputS3BucketName', false),
        outputS3KeyPrefix: tl.getInput('outputS3KeyPrefix', false),
        commandIdOutputVariable: tl.getInput('commandIdOutputVariable', false),
        instanceIds: undefined,
        instanceTags: undefined,
        instanceBuildVariable: undefined
    }

    switch (parameters.instanceSelector) {
        case fromInstanceIds:
            parameters.instanceIds = tl.getDelimitedInput('instanceIds', '\n', true)
            break

        case fromTags:
            parameters.instanceTags = tl.getDelimitedInput('instanceTags', '\n', true)
            break

        case fromBuildVariable:
            parameters.instanceBuildVariable = tl.getInput('instanceBuildVariable', true)
            break

        default:
            throw new Error(`Unknown value for instances selection: ${parameters.instanceSelector}`)
    }

    return parameters
}
