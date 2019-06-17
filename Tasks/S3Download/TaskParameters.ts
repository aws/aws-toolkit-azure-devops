/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, buildConnectionParameters } from 'Common/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

// options for Server-side encryption Key Management
export const noneOrAWSManagedKeyValue = 'noneOrAWSManaged'
export const customerManagedKeyValue = 'customerManaged'
export const aes256AlgorithmValue = 'AES256'

export interface TaskParameters {
    awsConnectionParameters: AWSConnectionParameters
    bucketName: string
    sourceFolder: string
    targetFolder: string
    globExpressions: string[]
    overwrite: boolean
    forcePathStyleAddressing: boolean
    flattenFolders: boolean
    keyManagement: string
    customerKey: Buffer
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        awsConnectionParameters: buildConnectionParameters(),
        bucketName: tl.getInput('bucketName', true),
        sourceFolder: tl.getPathInput('sourceFolder', false, false),
        targetFolder: tl.getPathInput('targetFolder', true, false),
        globExpressions: tl.getDelimitedInput('globExpressions', '\n', true),
        overwrite: tl.getBoolInput('overwrite', false),
        forcePathStyleAddressing: tl.getBoolInput('forcePathStyleAddressing', false),
        flattenFolders: tl.getBoolInput('flattenFolders', false),
        keyManagement: tl.getInput('keyManagement', false),
        customerKey: Buffer.from([])
    }

    if (parameters.keyManagement === customerManagedKeyValue) {
        const customerKey = tl.getInput('customerKey', true)
        parameters.customerKey = Buffer.from(customerKey, 'hex')
    }

    return parameters
}
