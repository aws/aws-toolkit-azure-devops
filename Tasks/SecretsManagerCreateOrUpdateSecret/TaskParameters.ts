/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export const stringSecretType: string = 'string'
export const binarySecretType: string = 'binary'

export const inlineSecretSource: string = 'inline'
export const fileSecretSource: string = 'file'

export const maxVersionStages: number = 20
export const maxTags: number = 50

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    secretNameOrId: string
    description: string
    kmsKeyId: string
    secretValueType: string
    secretValueSource: string
    secretValue: string
    secretValueFile: string
    autoCreateSecret: boolean
    tags: string[]
    arnOutputVariable: string
    versionIdOutputVariable: string
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        secretNameOrId: tl.getInput('secretNameOrId', true),
        description: tl.getInput('description', false),
        kmsKeyId: tl.getInput('kmsKeyId', false),
        secretValueType: tl.getInput('secretValueType', true),
        secretValueSource: tl.getInput('secretValueSource', true),
        secretValue: undefined,
        secretValueFile: undefined,
        autoCreateSecret:  tl.getBoolInput('autoCreateSecret', false),
        tags: undefined,
        arnOutputVariable: tl.getInput('arnOutputVariable', false),
        versionIdOutputVariable: tl.getInput('versionIdOutputVariable', false)
    }

    if (parameters.secretValueSource === inlineSecretSource) {
        parameters.secretValue = tl.getInput('secretValue', true)
    } else {
        parameters.secretValueFile = tl.getPathInput('secretValueFile', true, true)
    }

    if (parameters.autoCreateSecret) {
        parameters.tags = tl.getDelimitedInput('tags', '\n', false)
        if (parameters.tags) {
            const numTags = parameters.tags.length
            if (numTags > maxTags) {
                throw new Error(tl.loc('TooManyTags', numTags, maxTags))
            }
        }
    }

    return parameters
}
