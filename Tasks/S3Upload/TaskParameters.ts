/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import { getInputOrEmpty, getInputRequired } from 'Common/vstsUtils'
import * as tl from 'vsts-task-lib/task'

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
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        bucketName: getInputRequired('bucketName'),
        overwrite: tl.getBoolInput('overwrite', false),
        flattenFolders: tl.getBoolInput('flattenFolders', false),
        sourceFolder: tl.getPathInput('sourceFolder', true, true),
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
        customerKey: Buffer.from([])
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
