/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'
import tl = require('azure-pipelines-task-lib/task')

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
    fileExistsBehavior: string | undefined
    updateOutdatedInstancesOnly: boolean
    ignoreApplicationStopFailures: boolean
    outputVariable: string
    timeoutInMins: number
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        applicationName: getInputRequired('applicationName'),
        deploymentGroupName: getInputRequired('deploymentGroupName'),
        deploymentRevisionSource: getInputRequired('deploymentRevisionSource'),
        revisionBundle: '',
        bucketName: getInputRequired('bucketName'),
        bundlePrefix: '',
        bundleKey: '',
        description: getInputOrEmpty('description'),
        fileExistsBehavior: tl.getInput('fileExistsBehavior', false),
        updateOutdatedInstancesOnly: tl.getBoolInput('updateOutdatedInstancesOnly', false),
        ignoreApplicationStopFailures: tl.getBoolInput('ignoreApplicationStopFailures', false),
        outputVariable: getInputOrEmpty('outputVariable'),
        timeoutInMins: Number(tl.getInput('timeoutInMins', false)) || defaultTimeoutInMins
    }

    switch (parameters.deploymentRevisionSource) {
        case revisionSourceFromWorkspace:
            parameters.revisionBundle = tl.getPathInput('revisionBundle', true, true)
            parameters.bundlePrefix = getInputOrEmpty('bundlePrefix')
            break

        case revisionSourceFromS3:
            parameters.bundleKey = getInputRequired('bundleKey')
            break
    }

    return parameters
}
