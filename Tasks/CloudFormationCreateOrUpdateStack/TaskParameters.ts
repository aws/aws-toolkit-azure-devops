/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import fs = require('fs')
import tl = require('vsts-task-lib/task')

export const fileSource: string = 'file'
export const urlSource: string = 'url'
export const s3Source: string = 's3'
export const usePreviousTemplate: string = 'usePrevious'

export const maxRollbackTriggers: number = 5
export const maxTriggerMonitoringTime: number = 180

export const loadTemplateParametersFromFile: string = 'file'
export const loadTemplateParametersInline: string = 'inline'

export const ignoreStackOutputs: string = 'ignore'
export const stackOutputsAsVariables: string = 'asVariables'
export const stackOutputsAsJson: string = 'asJSON'

export const defaultTimeoutInMins: number = 60

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters,
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
    roleARN: string
    notificationARNs: string[]
    resourceTypes: string[]
    tags: string[]
    monitorRollbackTriggers: boolean
    monitoringTimeInMinutes: number
    rollbackTriggerARNs: string[]
    onFailure: string
    warnWhenNoWorkNeeded: boolean
    outputVariable: string
    captureStackOutputs: string
    captureAsSecuredVars: boolean
    timeoutInMins: number
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        stackName: tl.getInput('stackName', true),
        templateSource: tl.getInput('templateSource', true),
        templateFile: undefined,
        s3BucketName: undefined,
        s3ObjectKey: undefined,
        templateUrl: undefined,
        templateParametersSource: tl.getInput('templateParametersSource', true),
        templateParametersFile: undefined,
        templateParameters: undefined,
        useChangeSet: tl.getBoolInput('useChangeSet', false),
        changeSetName: undefined,
        description: tl.getInput('description', false),
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
        rollbackTriggerARNs: undefined,
        onFailure: tl.getInput('onFailure'),
        warnWhenNoWorkNeeded: tl.getBoolInput('warnWhenNoWorkNeeded'),
        outputVariable: tl.getInput('outputVariable', false),
        captureStackOutputs: tl.getInput('captureStackOutputs', false),
        captureAsSecuredVars: tl.getBoolInput('captureAsSecuredVars', false),
        timeoutInMins: defaultTimeoutInMins
    }

    switch (parameters.templateSource) {
        case fileSource:
            parameters.templateFile = tl.getPathInput('templateFile', true, true)
            parameters.s3BucketName = tl.getInput('s3BucketName', false)
            break

        case urlSource:
            parameters.templateUrl = tl.getInput('templateUrl', true)
            break

        case s3Source:
            parameters.s3BucketName = tl.getInput('s3BucketName', true)
            parameters.s3ObjectKey = tl.getInput('s3ObjectKey', true)
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
                if (fs.statSync(parameters.templateParametersFile).isDirectory()) {
                    parameters.templateParametersFile = undefined
                }
            }
            break

        case loadTemplateParametersInline:
            parameters.templateParameters = tl.getInput('templateParameters', true)
            break

        default:
            throw new Error(`Unrecognized template parameters source: ${parameters.templateParametersSource}`)
    }

    parameters.changeSetName = tl.getInput('changeSetName', parameters.useChangeSet)

    if (parameters.monitorRollbackTriggers) {
        const t = tl.getInput('monitoringTimeInMinutes', false)
        if (t) {
            parameters.monitoringTimeInMinutes = parseInt(t, 10)
            if (parameters.monitoringTimeInMinutes < 0
                || parameters.monitoringTimeInMinutes > maxTriggerMonitoringTime) {
                throw new Error(
                    tl.loc(
                        'InvalidTriggerMonitoringTime', parameters.monitoringTimeInMinutes, maxTriggerMonitoringTime))
            }
        }
        parameters.rollbackTriggerARNs = tl.getDelimitedInput('rollbackTriggerARNs', '\n', false)
        if (parameters.rollbackTriggerARNs && parameters.rollbackTriggerARNs.length > maxRollbackTriggers) {
            throw new Error(
                tl.loc('ExceededMaxRollbackTriggers', parameters.rollbackTriggerARNs.length, maxRollbackTriggers))
        }
    }

    const t = tl.getInput('timeoutInMins', false)
    if (t) {
        const tval = parseInt(t, 10)
        // allow for shorter periods if user wants, but filter out -ve/0 silliness
        if (tval > 0) {
            parameters.timeoutInMins = tval
        }
    }

    return parameters
}
