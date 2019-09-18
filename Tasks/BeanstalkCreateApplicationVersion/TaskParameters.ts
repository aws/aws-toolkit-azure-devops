/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

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
        applicationName: getInputRequired('applicationName'),
        applicationType: getInputRequired('applicationType'),
        webDeploymentArchive: '',
        dotnetPublishPath: '',
        deploymentBundleBucket: '',
        deploymentBundleKey: '',
        versionLabel: getInputOrEmpty('versionLabel'),
        description: getInputOrEmpty('description'),
        outputVariable: getInputOrEmpty('outputVariable')
    }

    switch (parameters.applicationType) {
        case applicationTypeAspNet:
            parameters.webDeploymentArchive = tl.getPathInput('webDeploymentArchive', true)
            break

        case applicationTypeAspNetCoreForWindows:
            parameters.dotnetPublishPath = tl.getPathInput('dotnetPublishPath', true)
            break

        case applicationTypeS3Archive:
            parameters.deploymentBundleBucket = getInputRequired('deploymentBundleBucket')
            parameters.deploymentBundleKey = getInputRequired('deploymentBundleKey')
            break
    }

    return parameters
}
