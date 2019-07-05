/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

// options for Server-side encryption Key Management; 'none' disables SSE
export const noKeyManagementValue: string = 'none'
export const awsKeyManagementValue: string = 'awsManaged'
export const customerKeyManagementValue: string = 'customerManaged'

// options for encryption algorithm when key management is set to 'aws';
// customer managed keys always use AES256
export const awskmsAlgorithmValue: string = 'KMS' // translated to aws:kms when used in api call
export const aes256AlgorithmValue: string = 'AES256'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    bucketName: string
    sourceFolder: string
    targetFolder: string
    flattenFolders: boolean
    overwrite: boolean
    globExpressions: string[]
    filesAcl: string
    createBucket: boolean
    contentType: string
    contentEncoding: string
    forcePathStyleAddressing: boolean
    storageClass: string
    keyManagement: string
    encryptionAlgorithm: string
    kmsMasterKeyId: string
    customerKey: Buffer
    cacheControl: string[]
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        bucketName: tl.getInput('bucketName', true),
        overwrite: tl.getBoolInput('overwrite', false),
        flattenFolders: tl.getBoolInput('flattenFolders', false),
        sourceFolder: tl.getPathInput('sourceFolder', true, true),
        targetFolder: tl.getInput('targetFolder', false),
        globExpressions: tl.getDelimitedInput('globExpressions', '\n', true),
        filesAcl: tl.getInput('filesAcl', false),
        createBucket: tl.getBoolInput('createBucket'),
        contentType: tl.getInput('contentType', false),
        contentEncoding: tl.getInput('contentEncoding', false),
        forcePathStyleAddressing: tl.getBoolInput('forcePathStyleAddressing', false),
        storageClass: tl.getInput('storageClass', false),
        keyManagement: undefined,
        encryptionAlgorithm: undefined,
        kmsMasterKeyId: undefined,
        customerKey: undefined,
        cacheControl: tl.getDelimitedInput('cacheControl', '\n', false)
    }
    if (!parameters.storageClass) {
        parameters.storageClass = 'STANDARD'
    }
    parameters.keyManagement = tl.getInput('keyManagement', false)
    if (parameters.keyManagement && parameters.keyManagement !== noKeyManagementValue) {
        switch (parameters.keyManagement) {
            case awsKeyManagementValue: {
                const algorithm = tl.getInput('encryptionAlgorithm', true)
                if (algorithm === awskmsAlgorithmValue) {
                    parameters.encryptionAlgorithm = 'aws:kms'
                } else {
                    parameters.encryptionAlgorithm = aes256AlgorithmValue
                }
                parameters.kmsMasterKeyId = tl.getInput('kmsMasterKeyId', algorithm === awskmsAlgorithmValue)
                break
            }

            case customerKeyManagementValue: {
                parameters.encryptionAlgorithm = aes256AlgorithmValue
                const customerKey = tl.getInput('customerKey', true)
                parameters.customerKey = Buffer.from(customerKey, 'hex')
                break
            }
        }
    }

    return parameters
}
