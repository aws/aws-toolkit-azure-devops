/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import base64 = require('base-64');
import SecretsManager = require('aws-sdk/clients/secretsmanager');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './GetSecretTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
     ) {
     }

    public async execute(): Promise<void> {
        await this.createServiceClients();

        console.log(tl.loc('RetrievingSecret', this.taskParameters.secretIdOrName));

        const request: SecretsManager.GetSecretValueRequest = {
            SecretId: this.taskParameters.secretIdOrName
        };

        if (this.taskParameters.versionId) {
            request.VersionId = this.taskParameters.versionId;
        } else if (this.taskParameters.versionStage) {
            request.VersionStage = this.taskParameters.versionStage;
        }

        const response = await this.secretsManagerClient.getSecretValue(request).promise();
        if (response.SecretString) {
            tl.setVariable(this.taskParameters.variableName, response.SecretString, true);
        } else {
            const v = base64.decode(response.SecretBinary);
            tl.setVariable(this.taskParameters.variableName, v, true);
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.variableName));
    }

    private secretsManagerClient: SecretsManager;

    private async createServiceClients(): Promise<void> {

        const opts: SecretsManager.ClientConfiguration = {
            apiVersion: '2017-10-17',
            credentials: this.taskParameters.Credentials,
            region: this.taskParameters.awsRegion
        };

        this.secretsManagerClient = SdkUtils.createAndConfigureSdkClient(SecretsManager, opts, this.taskParameters, tl.debug);
    }

}
