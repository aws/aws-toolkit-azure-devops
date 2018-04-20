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
import Parameters = require('./GetSecretTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async getSecret(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.createServiceClients(taskParameters);

        console.log(tl.loc('RetrievingSecret', taskParameters.secretIdOrName));

        const request: SecretsManager.GetSecretValueRequest = {
            SecretId: taskParameters.secretIdOrName
        };

        if (taskParameters.versionId) {
            request.VersionId = taskParameters.versionId;
        } else if (taskParameters.versionStage) {
            request.VersionStage = taskParameters.versionStage;
        }

        const response = await this.secretsManagerClient.getSecretValue(request).promise();
        if (response.SecretString) {
            tl.setVariable(taskParameters.variableName, response.SecretString, true);
        } else {
            const v = base64.decode(response.SecretBinary);
            tl.setVariable(taskParameters.variableName, v, true);
        }

        console.log(tl.loc('TaskCompleted', taskParameters.variableName));
    }

    private static secretsManagerClient: SecretsManager;

    private static async createServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const opts: SecretsManager.ClientConfiguration = {
            apiVersion: '2017-10-17',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };

        this.secretsManagerClient = sdkutils.createAndConfigureSdkClient(SecretsManager, opts, taskParameters, tl.debug);
    }

}
