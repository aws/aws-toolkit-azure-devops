/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'

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
    deadLetterARN: string | undefined
    kmsKeyARN: string | undefined
    environment: string[]
    tags: string[]
    securityGroups: string[]
    layers: string[]
    subnets: string[]
    tracingConfig: string
    outputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        deploymentMode: getInputRequired('deploymentMode'),
        functionName: getInputRequired('functionName'),
        functionHandler: '',
        runtime: '',
        codeLocation: getInputRequired('codeLocation'),
        localZipFile: '',
        s3Bucket: '',
        s3ObjectKey: '',
        s3ObjectVersion: undefined,
        roleARN: '',
        description: getInputOrEmpty('description'),
        memorySize: 128,
        timeout: 3,
        publish: tl.getBoolInput('publish', false),
        deadLetterARN: tl.getInput('deadLetterARN', false),
        kmsKeyARN: tl.getInput('kmsKeyARN', false),
        environment: tl.getDelimitedInput('environment', '\n', false),
        tags: tl.getDelimitedInput('tags', '\n', false),
        securityGroups: tl.getDelimitedInput('securityGroups', '\n', false),
        layers: tl.getDelimitedInput('layers', '\n', false),
        subnets: tl.getDelimitedInput('subnets', '\n', false),
        tracingConfig: getInputOrEmpty('tracingConfig'),
        outputVariable: getInputOrEmpty('outputVariable')
    }

    if (parameters.deploymentMode === deployCodeAndConfig) {
        parameters.functionHandler = getInputRequired('functionHandler')
        parameters.runtime = getInputRequired('runtime')
        parameters.roleARN = getInputRequired('roleARN')
    } else {
        parameters.functionHandler = getInputOrEmpty('functionHandler')
        parameters.runtime = getInputOrEmpty('runtime')
        parameters.roleARN = getInputOrEmpty('roleARN')
    }

    if (parameters.codeLocation === updateFromLocalFile) {
        parameters.localZipFile = tl.getPathInput('localZipFile', true, true)
    } else {
        parameters.s3Bucket = getInputRequired('s3Bucket')
        parameters.s3ObjectKey = getInputRequired('s3ObjectKey')
        parameters.s3ObjectVersion = tl.getInput('s3ObjectVersion', false)
    }

    const memorySizeTmp = tl.getInput('memorySize', false)
    if (memorySizeTmp) {
        const parsedInt = parseInt(memorySizeTmp, 10)
        if (!isNaN(parsedInt)) {
            parameters.memorySize = parsedInt
        }
    }

    const timeoutTmp = tl.getInput('timeout', false)
    if (timeoutTmp) {
        const parsedInt = parseInt(timeoutTmp, 10)
        if (!isNaN(parsedInt)) {
            parameters.timeout = parsedInt
        }
    }

    return parameters
}
