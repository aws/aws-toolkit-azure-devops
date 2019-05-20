/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const applicationTypeAspNet: string = 'aspnet'
export const applicationTypeAspNetCoreForWindows: string = 'aspnetCoreWindows'
export const applicationTypeS3Archive: string = 's3'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    applicationName: string
    applicationType: string
    webDeploymentArchive: string
    dotnetPublishPath: string
    deploymentBundleBucket: string
    deploymentBundleKey: string
    versionLabel: string
    description: string
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        applicationName: tl.getInput('applicationName', true),
        applicationType: tl.getInput('applicationType', true),
        webDeploymentArchive: undefined,
        dotnetPublishPath: undefined,
        deploymentBundleBucket: undefined,
        deploymentBundleKey: undefined,
        versionLabel: tl.getInput('versionLabel', false),
        description: tl.getInput('description', false),
        outputVariable: tl.getInput('outputVariable', false)
    }

    switch (parameters.applicationType) {
        case applicationTypeAspNet:
            parameters.webDeploymentArchive = tl.getPathInput('webDeploymentArchive', true)
            break

        case applicationTypeAspNetCoreForWindows:
            parameters.dotnetPublishPath = tl.getPathInput('dotnetPublishPath', true)
            break

        case applicationTypeS3Archive:
            parameters.deploymentBundleBucket = tl.getInput('deploymentBundleBucket', true)
            parameters.deploymentBundleKey = tl.getInput('deploymentBundleKey', true)
            break
    }

    return parameters
}
