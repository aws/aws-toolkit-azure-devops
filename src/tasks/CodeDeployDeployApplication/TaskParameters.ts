/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('azure-pipelines-task-lib/task')
import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired, getPathInputRequiredCheck } from 'lib/vstsUtils'

export const revisionSourceFromWorkspace = 'workspace'
export const revisionSourceFromS3 = 's3'
export const defaultTimeoutInMins = 30

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    applicationName: string
    deploymentGroupName: string
    deploymentRevisionSource: string
    revisionBundle: string
    bucketName: string
    bundlePrefix: string
    bundleKey: string
    filesAcl: string
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
        filesAcl: '',
        description: getInputOrEmpty('description'),
        fileExistsBehavior: tl.getInput('fileExistsBehavior', false),
        updateOutdatedInstancesOnly: tl.getBoolInput('updateOutdatedInstancesOnly', false),
        ignoreApplicationStopFailures: tl.getBoolInput('ignoreApplicationStopFailures', false),
        outputVariable: getInputOrEmpty('outputVariable'),
        timeoutInMins: Number(tl.getInput('timeoutInMins', false)) || defaultTimeoutInMins
    }

    switch (parameters.deploymentRevisionSource) {
        case revisionSourceFromWorkspace:
            parameters.revisionBundle = getPathInputRequiredCheck('revisionBundle')
            parameters.bundlePrefix = getInputOrEmpty('bundlePrefix')
            parameters.filesAcl = getInputOrEmpty('filesAcl')
            break

        case revisionSourceFromS3:
            parameters.bundleKey = getInputRequired('bundleKey')
            break
    }

    return parameters
}
