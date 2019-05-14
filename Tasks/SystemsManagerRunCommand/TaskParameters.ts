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
    awsConnectionParameters: AWSConnectionParameters,
    documentName: string,
    documentParameters: string,
    serviceRoleARN: string,
    comment: string,
    instanceSelector: string,
    instanceIds: string[],
    instanceTags: string[],
    instanceBuildVariable: string,
    maxConcurrency: string,
    maxErrors: string,
    timeout: string,
    notificationArn: string,
    notificationEvents: string,
    notificationType: string,
    outputS3BucketName: string,
    outputS3KeyPrefix: string,
    commandIdOutputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters()
    }

    this.documentName = tl.getInput('documentName', true)
    this.documentParameters = tl.getInput('documentParameters', false)
    this.serviceRoleARN = tl.getInput('serviceRoleARN', false)
    this.comment = tl.getInput('comment', false)

    this.instanceSelector = tl.getInput('instanceSelector', true)
    switch (this.instanceSelector) {
        case TaskParameters.fromInstanceIds: {
            this.instanceIds = tl.getDelimitedInput('instanceIds', '\n', true)
        }
                                             break

        case TaskParameters.fromTags: {
            this.instanceTags = tl.getDelimitedInput('instanceTags', '\n', true)
        }
                                      break

        case TaskParameters.fromBuildVariable: {
            this.instanceBuildVariable = tl.getInput('instanceBuildVariable', true)
        }
                                               break

        default:
            throw new Error(`Unknown value for instances selection: ${this.instanceSelector}`)
    }

    this.maxConcurrency = tl.getInput('maxConcurrency', false)
    this.maxErrors = tl.getInput('maxErrors', false)
    this.timeout = tl.getInput('timeout', false)

    this.notificationArn = tl.getInput('notificationArn', false)
    this.notificationEvents = tl.getInput('notificationEvents', false)
    this.notificationType = tl.getInput('notificationType', false)

    this.outputS3BucketName = tl.getInput('outputS3BucketName', false)
    this.outputS3KeyPrefix = tl.getInput('outputS3KeyPrefix', false)
    this.commandIdOutputVariable = tl.getInput('commandIdOutputVariable', false)

    return parameters
}
