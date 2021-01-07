/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired, getPathInputRequired } from 'lib/vstsUtils'

export const applicationTypeAspNet = 'aspnet'
export const applicationTypeAspNetCoreForWindows = 'aspnetCoreWindows'
export const applicationTypeS3Archive = 's3'

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
            parameters.webDeploymentArchive = getPathInputRequired('webDeploymentArchive')
            break

        case applicationTypeAspNetCoreForWindows:
            parameters.dotnetPublishPath = getPathInputRequired('dotnetPublishPath')
            break

        case applicationTypeS3Archive:
            parameters.deploymentBundleBucket = getInputRequired('deploymentBundleBucket')
            parameters.deploymentBundleKey = getInputRequired('deploymentBundleKey')
            break
    }

    return parameters
}
