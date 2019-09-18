/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOptional, getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'
import tl = require('azure-pipelines-task-lib/task')

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
    kmsKeyId: string | undefined
    secretValueType: string
    secretValueSource: string
    secretValue: string
    secretValueFile: string
    autoCreateSecret: boolean | undefined
    tags: string[]
    arnOutputVariable: string | undefined
    versionIdOutputVariable: string | undefined
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        secretNameOrId: getInputRequired('secretNameOrId'),
        description: getInputOrEmpty('description'),
        kmsKeyId: getInputOptional('kmsKeyId'),
        secretValueType: getInputRequired('secretValueType'),
        secretValueSource: getInputRequired('secretValueSource'),
        secretValue: '',
        secretValueFile: '',
        autoCreateSecret: tl.getBoolInput('autoCreateSecret', false),
        tags: [],
        arnOutputVariable: tl.getInput('arnOutputVariable', false),
        versionIdOutputVariable: tl.getInput('versionIdOutputVariable', false)
    }

    if (parameters.secretValueSource === inlineSecretSource) {
        parameters.secretValue = getInputRequired('secretValue')
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
