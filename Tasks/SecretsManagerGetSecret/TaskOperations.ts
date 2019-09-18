/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import SecretsManager = require('aws-sdk/clients/secretsmanager')
import base64 = require('base-64')
import tl = require('azure-pipelines-task-lib/task')
import { TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly secretsManagerClient: SecretsManager,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
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
            const v = base64.decode(`${response.SecretBinary}`)
            tl.setVariable(this.taskParameters.variableName, v.trim(), true)
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.variableName))
    }
}
