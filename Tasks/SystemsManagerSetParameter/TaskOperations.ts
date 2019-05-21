/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import SSM = require('aws-sdk/clients/ssm')
import path = require('path')
import tl = require('vsts-task-lib/task')
import { secureStringType, TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(public readonly ssmClient: SSM, public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        // to avoid a security breach if someone tries to rewrite a secure string as a plain
        // value, test for existence and type and force a secure update if necessary
        const forceAsSecureString = await this.testParameterExistsAndIsSecureStringType(
            this.taskParameters.parameterName
        )
        await this.createOrUpdateParameter(forceAsSecureString)

        console.log(tl.loc('TaskCompleted'))
    }

    private async createOrUpdateParameter(forceAsSecureString: boolean): Promise<void> {
        try {
            await this.ssmClient
                .putParameter({
                    Name: this.taskParameters.parameterName,
                    Type: forceAsSecureString ? 'SecureString' : this.taskParameters.parameterType,
                    Value: this.taskParameters.parameterValue,
                    Overwrite: true,
                    KeyId: this.taskParameters.encryptionKeyId
                })
                .promise()
        } catch (error) {
            throw new Error(tl.loc('CreateOrUpdateFailed', error))
        }
    }

    private async testParameterExistsAndIsSecureStringType(parameterName: string): Promise<boolean> {
        let result: boolean = false

        try {
            const response = await this.ssmClient
                .getParameter({
                    Name: parameterName
                })
                .promise()

            result = response.Parameter.Type === secureStringType
            if (result) {
                console.log(tl.loc('ParameterExistsAndIsSecureString', parameterName))
            } else {
                console.log(tl.loc('ParameterExistsAndIsNotSecureString', parameterName))
            }
        } catch (error) {
            // tslint:disable-next-line: no-unsafe-any
            if (error.code === 'ParameterNotFound') {
                console.log(tl.loc('ParameterDoesNotExist', parameterName))
            } else {
                throw new Error(tl.loc('ErrorTestingParameter', error))
            }
        }

        return result
    }
}
