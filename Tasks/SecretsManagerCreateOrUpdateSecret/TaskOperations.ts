/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import SecretsManager = require('aws-sdk/clients/secretsmanager')
import { SdkUtils } from 'Common/sdkutils'
import fs = require('fs')
import tl = require('vsts-task-lib/task')
import { binarySecretType, inlineSecretSource, stringSecretType, TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly secretsManagerClient: SecretsManager,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        try {
            await this.updateSecret()
            console.log(tl.loc('UpdateSecretCompleted'))
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            if (err !== undefined && err.code === 'ResourceNotFoundException') {
                if (this.taskParameters.autoCreateSecret) {
                    await this.createSecret()
                    console.log(tl.loc('CreateSecretCompleted'))
                } else {
                    throw new Error(tl.loc('SecretNotFound'))
                }
            } else {
                throw new Error(tl.loc('SecretUpdateFailed', err))
            }
        }
    }

    private async updateSecret(): Promise<void> {
        console.log(tl.loc('UpdatingSecret', this.taskParameters.secretNameOrId))

        // treat updating descrption et al about the secret as distinct from a value update
        if (this.taskParameters.description || this.taskParameters.kmsKeyId) {
            const updateMetaRequest: SecretsManager.UpdateSecretRequest = {
                SecretId: this.taskParameters.secretNameOrId,
                Description: this.taskParameters.description,
                KmsKeyId: this.taskParameters.kmsKeyId
            }

            await this.secretsManagerClient.updateSecret(updateMetaRequest).promise()
        }

        const updateValueRequest: SecretsManager.PutSecretValueRequest = {
            SecretId: this.taskParameters.secretNameOrId
        }

        if (this.taskParameters.secretValueSource === inlineSecretSource) {
            updateValueRequest.SecretString = this.taskParameters.secretValue
        } else {
            switch (this.taskParameters.secretValueType) {
                case stringSecretType: {
                    updateValueRequest.SecretString = fs.readFileSync(this.taskParameters.secretValueFile, 'utf8')
                    break
                }

                case binarySecretType: {
                    updateValueRequest.SecretBinary = fs.readFileSync(this.taskParameters.secretValueFile)
                    break
                }
            }
        }

        const response = await this.secretsManagerClient.putSecretValue(updateValueRequest).promise()

        if (this.taskParameters.arnOutputVariable) {
            console.log(tl.loc('SettingArnOutputVariable', this.taskParameters.arnOutputVariable))
            tl.setVariable(this.taskParameters.arnOutputVariable, response.ARN)
        }

        if (this.taskParameters.versionIdOutputVariable) {
            console.log(tl.loc('SettingVersionIdOutputVariable', this.taskParameters.versionIdOutputVariable))
            tl.setVariable(this.taskParameters.versionIdOutputVariable, response.VersionId)
        }
    }

    private async createSecret(): Promise<void> {
        console.log(tl.loc('SecretNotFoundAutoCreating'))

        const request: SecretsManager.CreateSecretRequest = {
            Name: this.taskParameters.secretNameOrId,
            KmsKeyId: this.taskParameters.kmsKeyId,
            Description: this.taskParameters.description
        }

        if (this.taskParameters.secretValueSource === inlineSecretSource) {
            request.SecretString = this.taskParameters.secretValue
        } else {
            switch (this.taskParameters.secretValueType) {
                case stringSecretType:
                    request.SecretString = fs.readFileSync(this.taskParameters.secretValueFile, 'utf8')
                    break

                case binarySecretType:
                    request.SecretBinary = fs.readFileSync(this.taskParameters.secretValueFile)
                    break
            }
        }

        if (this.taskParameters.tags) {
            request.Tags = SdkUtils.getTags<SecretsManager.Tag[]>(this.taskParameters.tags)
        }

        const response = await this.secretsManagerClient.createSecret(request).promise()

        if (this.taskParameters.arnOutputVariable) {
            console.log(tl.loc('SettingArnOutputVariable', this.taskParameters.arnOutputVariable))
            tl.setVariable(this.taskParameters.arnOutputVariable, response.ARN)
        }

        if (this.taskParameters.versionIdOutputVariable) {
            console.log(tl.loc('SettingVersionIdOutputVariable', this.taskParameters.versionIdOutputVariable))
            tl.setVariable(this.taskParameters.versionIdOutputVariable, response.VersionId)
        }
    }
}
