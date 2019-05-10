/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import SecretsManager = require('aws-sdk/clients/secretsmanager')
import base64 = require('base-64')
import { SdkUtils } from 'sdkutils/sdkutils'
import tl = require('vsts-task-lib/task')
import { TaskParameters } from './GetSecretTaskParameters'

export class TaskOperations {

    private secretsManagerClient: SecretsManager

    public constructor(
        public readonly taskParameters: TaskParameters
     ) {
     }

    public async execute(): Promise<void> {
        await this.createServiceClients()

        console.log(tl.loc('RetrievingSecret', this.taskParameters.secretIdOrName))

        const request: SecretsManager.GetSecretValueRequest = {
            SecretId: this.taskParameters.secretIdOrName
        }

        if (this.taskParameters.versionId) {
            request.VersionId = this.taskParameters.versionId
        } else if (this.taskParameters.versionStage) {
            request.VersionStage = this.taskParameters.versionStage
        }

        const response = await this.secretsManagerClient.getSecretValue(request).promise()
        if (response.SecretString) {
            tl.setVariable(this.taskParameters.variableName, response.SecretString, true)
        } else {
            // tslint:disable-next-line: no-unsafe-any
            const v = base64.decode(response.SecretBinary)
            // tslint:disable-next-line: no-unsafe-any
            tl.setVariable(this.taskParameters.variableName, v, true)
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.variableName))
    }

    private async createServiceClients(): Promise<void> {

        const opts: SecretsManager.ClientConfiguration = {
            apiVersion: '2017-10-17'
        }

        // tslint:disable-next-line: no-unsafe-any
        this.secretsManagerClient = await SdkUtils.createAndConfigureSdkClient(
            SecretsManager,
            opts,
            this.taskParameters,
            tl.debug)
    }

}
