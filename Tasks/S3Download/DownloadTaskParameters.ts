/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters } from 'sdkutils/awsConnectionParameters'
import tl = require('vsts-task-lib/task')

export class TaskParameters {
    // options for Server-side encryption Key Management
    public static readonly noneOrAWSManagedKeyValue: string = 'noneOrAWSManaged'
    public static readonly customerManagedKeyValue: string = 'customerManaged'

    public static readonly aes256AlgorithmValue: string = 'AES256'

    public awsConnectionParameters: AWSConnectionParameters
    public bucketName: string
    public sourceFolder: string
    public targetFolder: string
    public globExpressions: string[]
    public overwrite: boolean
    public forcePathStyleAddressing: boolean
    public flattenFolders: boolean
    public keyManagement: string
    public customerKey: Buffer

    public static build(): TaskParameters {
        const taskParameters: TaskParameters = new TaskParameters()
        try {
            taskParameters.awsConnectionParameters = new AWSConnectionParameters()
            taskParameters.bucketName = tl.getInput('bucketName', true)
            taskParameters.sourceFolder = tl.getPathInput('sourceFolder', false, false)
            taskParameters.targetFolder = tl.getPathInput('targetFolder', true, false)
            taskParameters.globExpressions = tl.getDelimitedInput('globExpressions', '\n', true)
            taskParameters.overwrite = tl.getBoolInput('overwrite', false)
            taskParameters.forcePathStyleAddressing = tl.getBoolInput('forcePathStyleAddressing', false)
            taskParameters.flattenFolders = tl.getBoolInput('flattenFolders', false)

            taskParameters.keyManagement = tl.getInput('keyManagement', false)
            if (taskParameters.keyManagement === TaskParameters.customerManagedKeyValue) {
                const customerKey = tl.getInput('customerKey', true)
                taskParameters.customerKey = Buffer.from(customerKey, 'hex')
            }
        } catch (error) {
            throw new Error(error.message)
        }

        return taskParameters
    }
}
