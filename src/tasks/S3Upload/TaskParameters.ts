/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { AWSConnectionParameters, buildConnectionParameters } from 'lib/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired, getPathInputRequiredCheck } from 'lib/vstsUtils'

// options for Server-side encryption Key Management; 'none' disables SSE
export const noKeyManagementValue = 'none'
export const awsKeyManagementValue = 'awsManaged'
export const customerKeyManagementValue = 'customerManaged'

// options for encryption algorithm when key management is set to 'aws';
// customer managed keys always use AES256
export const awskmsAlgorithmValue = 'KMS' // translated to aws:kms when used in api call
export const aes256AlgorithmValue = 'AES256'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    bucketName: string
    sourceFolder: string
    targetFolder: string
    flattenFolders: boolean
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
        bucketName: getInputRequired('bucketName'),
        flattenFolders: tl.getBoolInput('flattenFolders', false),
        sourceFolder: getPathInputRequiredCheck('sourceFolder'),
        targetFolder: getInputOrEmpty('targetFolder'),
        globExpressions: tl.getDelimitedInput('globExpressions', '\n', true),
        filesAcl: getInputOrEmpty('filesAcl'),
        createBucket: tl.getBoolInput('createBucket'),
        contentType: getInputOrEmpty('contentType'),
        contentEncoding: getInputOrEmpty('contentEncoding'),
        forcePathStyleAddressing: tl.getBoolInput('forcePathStyleAddressing', false),
        storageClass: getInputOrEmpty('storageClass'),
        keyManagement: '',
        encryptionAlgorithm: '',
        kmsMasterKeyId: '',
        customerKey: Buffer.from([]),
        cacheControl: tl.getDelimitedInput('cacheControl', '\n', false)
    }
    if (!parameters.storageClass) {
        parameters.storageClass = 'STANDARD'
    }
    parameters.keyManagement = getInputOrEmpty('keyManagement')
    if (parameters.keyManagement && parameters.keyManagement !== noKeyManagementValue) {
        switch (parameters.keyManagement) {
            case awsKeyManagementValue: {
                const algorithm = tl.getInput('encryptionAlgorithm', true)
                if (algorithm === awskmsAlgorithmValue) {
                    parameters.encryptionAlgorithm = 'aws:kms'
                } else {
                    parameters.encryptionAlgorithm = aes256AlgorithmValue
                }
                parameters.kmsMasterKeyId = tl.getInput('kmsMasterKeyId', algorithm === awskmsAlgorithmValue) || ''
                break
            }

            case customerKeyManagementValue: {
                parameters.encryptionAlgorithm = aes256AlgorithmValue
                const customerKey = getInputRequired('customerKey')
                parameters.customerKey = Buffer.from(customerKey, 'hex')
                break
            }
        }
    }

    return parameters
}
