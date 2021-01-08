/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'
import { getPathInputRequiredCheck } from 'lib/vstsUtils'
import { getPathInputRequired } from 'lib/vstsUtils'

// option values for the 'deploymentType' property
export const deployFunction = 'deployFunction'
export const deployServerless = 'deployServerless'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    command: string
    packageOnly: boolean
    lambdaProjectPath: string
    // Used in package-only mode, contains either the filename and path of the
    // output package for a Lambda function, or the template output path when
    // packaging a serverless app
    packageOutputFile: string
    functionHandler: string
    functionName: string
    functionRole: string
    functionMemory: number | undefined
    functionTimeout: number | undefined
    stackName: string
    s3Bucket: string
    s3Prefix: string
    additionalArgs: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        command: getInputRequired('command'),
        packageOnly: tl.getBoolInput('packageOnly', true),
        lambdaProjectPath: getPathInputRequiredCheck('lambdaProjectPath'),
        packageOutputFile: '',
        functionHandler: getInputOrEmpty('functionHandler'),
        functionName: getInputOrEmpty('functionName'),
        functionRole: getInputOrEmpty('functionRole'),
        functionMemory: undefined,
        functionTimeout: undefined,
        stackName: getInputOrEmpty('stackName'),
        s3Bucket: getInputOrEmpty('s3Bucket'),
        s3Prefix: getInputOrEmpty('s3Prefix'),
        additionalArgs: tl.getInput('additionalArgs', false) || ''
    }

    if (parameters.packageOnly) {
        parameters.packageOutputFile = getPathInputRequired('packageOutputFile')
    }
    if (tl.getInput('functionMemory', false)) {
        parameters.functionMemory = parseInt(getInputRequired('functionMemory'), 10)
    }
    if (tl.getInput('functionTimeout', false)) {
        parameters.functionTimeout = parseInt(getInputRequired('functionTimeout'), 10)
    }

    return parameters
}
