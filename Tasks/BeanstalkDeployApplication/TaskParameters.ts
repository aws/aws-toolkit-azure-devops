/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib')

export const applicationTypeAspNet: string = 'aspnet'
export const applicationTypeAspNetCoreForWindows: string = 'aspnetCoreWindows'
export const applicationTypeS3Archive: string = 's3'
export const applicationTypeExistingVersion: string = 'version'

export const defaultEventPollingDelay: number = 5 // seconds
export const maxEventPollingDelay: number = 300 // seconds, 5 mins

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    applicationName: string
    environmentName: string
    applicationType: string
    versionLabel: string
    webDeploymentArchive: string
    dotnetPublishPath: string
    deploymentBundleBucket: string
    deploymentBundleKey: string
    description: string
    outputVariable: string
    eventPollingDelay: number
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        applicationName: tl.getInput('applicationName', true),
        environmentName: tl.getInput('environmentName', true),
        applicationType: tl.getInput('applicationType', true),
        versionLabel: undefined,
        webDeploymentArchive: undefined,
        dotnetPublishPath: undefined,
        deploymentBundleBucket: undefined,
        deploymentBundleKey: undefined,
        description: tl.getInput('description', false),
        outputVariable: tl.getInput('outputVariable', false),
        eventPollingDelay: defaultEventPollingDelay
    }

    console.log(tl.loc('DisplayApplicationType', parameters.applicationType))

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

        default:
            // version label read below
            break
    }

    parameters.versionLabel = tl.getInput('versionLabel', parameters.applicationType === applicationTypeExistingVersion)

    const pollDelay = tl.getInput('eventPollingDelay', false)
    if (pollDelay) {
        try {
            const pollDelayValue = parseInt(pollDelay, 10)
            if (pollDelayValue >= defaultEventPollingDelay && pollDelayValue <= maxEventPollingDelay) {
                parameters.eventPollingDelay = pollDelayValue
            } else {
                throw new Error()
            }
        } catch {
            console.log(tl.loc('InvalidEventPollDelay', pollDelay, defaultEventPollingDelay, maxEventPollingDelay))
        }
    }

    return parameters
}