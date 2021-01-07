/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { defaultTimeoutInMins } from 'lib/cloudformationutils'
import { getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'
import { statSync } from 'fs'

export const fileSource = 'file'
export const urlSource = 'url'
export const s3Source = 's3'
export const usePreviousTemplate = 'usePrevious'

export const maxRollbackTriggers = 5
export const maxTriggerMonitoringTime = 180

export const loadTemplateParametersFromFile = 'file'
export const loadTemplateParametersInline = 'inline'

export const ignoreStackOutputs = 'ignore'
export const stackOutputsAsVariables = 'asVariables'
export const stackOutputsAsJson = 'asJSON'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    stackName: string
    templateSource: string
    templateFile: string
    s3BucketName: string
    s3ObjectKey: string
    templateUrl: string
    templateParametersSource: string
    templateParametersFile: string
    templateParameters: string
    useChangeSet: boolean
    changeSetName: string
    description: string
    autoExecuteChangeSet: boolean
    capabilityIAM: boolean
    capabilityNamedIAM: boolean
    capabilityAutoExpand: boolean
    roleARN: string | undefined
    notificationARNs: string[]
    resourceTypes: string[]
    tags: string[]
    monitorRollbackTriggers: boolean
    monitoringTimeInMinutes: number
    rollbackTriggerARNs: string[]
    onFailure: string | undefined
    warnWhenNoWorkNeeded: boolean
    outputVariable: string
    captureStackOutputs: string
    captureAsSecuredVars: boolean
    timeoutInMins: number
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        stackName: getInputRequired('stackName'),
        templateSource: getInputRequired('templateSource'),
        templateFile: '',
        s3BucketName: '',
        s3ObjectKey: '',
        templateUrl: '',
        templateParametersSource: getInputRequired('templateParametersSource'),
        templateParametersFile: '',
        templateParameters: '',
        useChangeSet: tl.getBoolInput('useChangeSet', false),
        changeSetName: '',
        description: getInputOrEmpty('description'),
        autoExecuteChangeSet: tl.getBoolInput('autoExecuteChangeSet', false),
        capabilityIAM: tl.getBoolInput('capabilityIAM', false),
        capabilityNamedIAM: tl.getBoolInput('capabilityNamedIAM', false),
        capabilityAutoExpand: tl.getBoolInput('capabilityAutoExpand', false),
        roleARN: tl.getInput('roleARN', false),
        notificationARNs: tl.getDelimitedInput('notificationARNs', '\n', false),
        resourceTypes: tl.getDelimitedInput('resourceTypes', '\n', false),
        tags: tl.getDelimitedInput('tags', '\n', false),
        monitorRollbackTriggers: tl.getBoolInput('monitorRollbackTriggers', false),
        monitoringTimeInMinutes: 0,
        rollbackTriggerARNs: [],
        onFailure: tl.getInput('onFailure', false),
        warnWhenNoWorkNeeded: tl.getBoolInput('warnWhenNoWorkNeeded'),
        outputVariable: getInputOrEmpty('outputVariable'),
        captureStackOutputs: getInputOrEmpty('captureStackOutputs'),
        captureAsSecuredVars: tl.getBoolInput('captureAsSecuredVars', false),
        timeoutInMins: defaultTimeoutInMins
    }

    switch (parameters.templateSource) {
        case fileSource:
            parameters.templateFile = tl.getPathInput('templateFile', true, true)
            parameters.s3BucketName = getInputOrEmpty('s3BucketName')
            break

        case urlSource:
            parameters.templateUrl = getInputRequired('templateUrl')
            break

        case s3Source:
            parameters.s3BucketName = getInputRequired('s3BucketName')
            parameters.s3ObjectKey = getInputRequired('s3ObjectKey')
            break

        case usePreviousTemplate:
            // No more parameters are needed
            break

        default:
            throw new Error(`Unrecognized template source: ${parameters.templateSource}`)
    }

    switch (parameters.templateParametersSource) {
        case loadTemplateParametersFromFile:
            // Value set optional for backwards compatibilty, to enable continued operation of
            // tasks configured before 'inline' mode was added.
            // Note that if the user does not give a value then instead of an empty/null
            // path (per default value for the field), we get what appears to be the root
            // of the repository path. To solve this without needing to add a task parameter
            // to indicate we should use a parameter file (a breaking change) we do a simple
            // directory vs file test
            parameters.templateParametersFile = tl.getPathInput('templateParametersFile', false, true)
            if (parameters.templateParametersFile) {
                if (statSync(parameters.templateParametersFile).isDirectory()) {
                    parameters.templateParametersFile = ''
                }
            }
            break

        case loadTemplateParametersInline:
            parameters.templateParameters = getInputRequired('templateParameters')
            break

        default:
            throw new Error(`Unrecognized template parameters source: ${parameters.templateParametersSource}`)
    }

    if (parameters.useChangeSet) {
        parameters.changeSetName = getInputRequired('changeSetName')
    } else {
        parameters.changeSetName = getInputOrEmpty('changeSetName')
    }

    if (parameters.monitorRollbackTriggers) {
        const monitoringTime = tl.getInput('monitoringTimeInMinutes', false)
        if (monitoringTime) {
            parameters.monitoringTimeInMinutes = parseInt(monitoringTime, 10)
            if (
                parameters.monitoringTimeInMinutes < 0 ||
                parameters.monitoringTimeInMinutes > maxTriggerMonitoringTime
            ) {
                throw new Error(
                    tl.loc('InvalidTriggerMonitoringTime', parameters.monitoringTimeInMinutes, maxTriggerMonitoringTime)
                )
            }
        }
        parameters.rollbackTriggerARNs = tl.getDelimitedInput('rollbackTriggerARNs', '\n', false)
        if (parameters.rollbackTriggerARNs && parameters.rollbackTriggerARNs.length > maxRollbackTriggers) {
            throw new Error(
                tl.loc('ExceededMaxRollbackTriggers', parameters.rollbackTriggerARNs.length, maxRollbackTriggers)
            )
        }
    }

    const timeout = tl.getInput('timeoutInMins', false)
    if (timeout) {
        const tval = parseInt(timeout, 10)
        // allow for shorter periods if user wants, but filter out -ve/0 silliness
        if (tval > 0) {
            parameters.timeoutInMins = tval
        }
    }

    return parameters
}
