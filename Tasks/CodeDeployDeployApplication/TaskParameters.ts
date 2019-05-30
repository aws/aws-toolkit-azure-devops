/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const revisionSourceFromWorkspace: string = 'workspace'
export const revisionSourceFromS3: string = 's3'
export const defaultTimeoutInMins: number = 30

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    applicationName: string
    deploymentGroupName: string
    deploymentRevisionSource: string
    revisionBundle: string
    bucketName: string
    bundlePrefix: string
    bundleKey: string
    description: string
    fileExistsBehavior: string
    updateOutdatedInstancesOnly: boolean
    ignoreApplicationStopFailures: boolean
    outputVariable: string
    timeoutInMins: number
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        applicationName: tl.getInput('applicationName', true),
        deploymentGroupName: tl.getInput('deploymentGroupName', true),
        deploymentRevisionSource: tl.getInput('deploymentRevisionSource', true),
        revisionBundle: undefined,
        bucketName: tl.getInput('bucketName', true),
        bundlePrefix: undefined,
        bundleKey: undefined,
        description: tl.getInput('description', false),
        fileExistsBehavior: tl.getInput('fileExistsBehavior', false),
        updateOutdatedInstancesOnly: tl.getBoolInput('updateOutdatedInstancesOnly', false),
        ignoreApplicationStopFailures: tl.getBoolInput('ignoreApplicationStopFailures', false),
        outputVariable: tl.getInput('outputVariable', false),
        timeoutInMins: Number(tl.getInput('timeoutInMins', false)) || defaultTimeoutInMins
    }

    switch (parameters.deploymentRevisionSource) {
        case revisionSourceFromWorkspace:
            parameters.revisionBundle = tl.getPathInput('revisionBundle', true, true)
            parameters.bundlePrefix = tl.getInput('bundlePrefix', false)
            break

        case revisionSourceFromS3:
            parameters.bundleKey = tl.getInput('bundleKey', true)
            break
    }

    return parameters
}
