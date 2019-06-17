/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

// option values for the 'deploymentType' property
export const deployFunction: string = 'deployFunction'
export const deployServerless: string = 'deployServerless'

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
        command: tl.getInput('command', true),
        packageOnly: tl.getBoolInput('packageOnly', true),
        lambdaProjectPath: tl.getPathInput('lambdaProjectPath', true, true),
        packageOutputFile: '',
        functionHandler: tl.getInput('functionHandler', false),
        functionName: tl.getInput('functionName', false),
        functionRole: tl.getInput('functionRole', false),
        functionMemory: undefined,
        functionTimeout: undefined,
        stackName: tl.getInput('stackName', false),
        s3Bucket: tl.getInput('s3Bucket', false),
        s3Prefix: tl.getInput('s3Prefix', false),
        additionalArgs: tl.getInput('additionalArgs', false) || ''
    }

    if (parameters.packageOnly) {
        parameters.packageOutputFile = tl.getPathInput('packageOutputFile', true, false)
    }
    if (tl.getInput('functionMemory', false)) {
        parameters.functionMemory = parseInt(tl.getInput('functionMemory', false), 10)
    }
    if (tl.getInput('functionTimeout', false)) {
        parameters.functionTimeout = parseInt(tl.getInput('functionTimeout', false), 10)
    }

    return parameters
}
