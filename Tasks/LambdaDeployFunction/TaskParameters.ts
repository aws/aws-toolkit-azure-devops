/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

// possible values for the deploymentMode parameter
export const deployCodeOnly: string = 'codeonly'
export const deployCodeAndConfig: string = 'codeandconfiguration'

// possible values for the codeLocation parameter
export const updateFromLocalFile: string = 'localfile'
export const updateFromS3Object: string = 's3object'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    deploymentMode: string
    functionName: string
    functionHandler: string
    runtime: string
    codeLocation: string
    localZipFile: string
    s3Bucket: string
    s3ObjectKey: string
    s3ObjectVersion: string | undefined
    roleARN: string
    description: string
    memorySize: number
    timeout: number
    publish: boolean
    deadLetterARN: string
    kmsKeyARN: string
    environment: string[]
    tags: string[]
    securityGroups: string[]
    subnets: string[]
    tracingConfig: string
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        deploymentMode: tl.getInput('deploymentMode', true),
        functionName: tl.getInput('functionName', true),
        functionHandler: '',
        runtime: '',
        codeLocation: tl.getInput('codeLocation', true),
        localZipFile: '',
        s3Bucket: '',
        s3ObjectKey: '',
        s3ObjectVersion: undefined,
        roleARN: '',
        description: tl.getInput('description', false),
        memorySize: 128,
        timeout: 3,
        publish: tl.getBoolInput('publish', false),
        deadLetterARN: tl.getInput('deadLetterARN', false),
        kmsKeyARN: tl.getInput('kmsKeyARN', false),
        environment: tl.getDelimitedInput('environment', '\n', false),
        tags: tl.getDelimitedInput('tags', '\n', false),
        securityGroups: tl.getDelimitedInput('securityGroups', '\n', false),
        subnets: tl.getDelimitedInput('subnets', '\n', false),
        tracingConfig: tl.getInput('tracingConfig', false),
        outputVariable: tl.getInput('outputVariable', false)
    }

    const requireBasicConfigFields = parameters.deploymentMode === deployCodeAndConfig
    parameters.functionHandler = tl.getInput('functionHandler', requireBasicConfigFields)
    parameters.runtime = tl.getInput('runtime', requireBasicConfigFields)
    parameters.roleARN = tl.getInput('roleARN', requireBasicConfigFields)

    if (parameters.codeLocation === updateFromLocalFile) {
        parameters.localZipFile = tl.getPathInput('localZipFile', true, true)
    } else {
        parameters.s3Bucket = tl.getInput('s3Bucket', true)
        parameters.s3ObjectKey = tl.getInput('s3ObjectKey', true)
        parameters.s3ObjectVersion = tl.getInput('s3ObjectVersion', false)
    }

    const memorySizeTmp = tl.getInput('memorySize', false)
    if (memorySizeTmp) {
        parameters.memorySize = parseInt(memorySizeTmp, 10)
    }

    const timeoutTmp = tl.getInput('timeout', false)
    if (timeoutTmp) {
        parameters.timeout = parseInt(timeoutTmp, 10)
    }

    return parameters
}
