/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import fs = require('fs');
import path = require('path');
import SecretsManager = require('aws-sdk/clients/secretsmanager');
import Parameters = require('./CreateOrUpdateSecretTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async createOrUpdateSecret(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.createServiceClients(taskParameters);

        try {
            await this.updateSecret(taskParameters);
        } catch (err) {
            if (err.code === 'ResourceNotFoundException') {
                if (taskParameters.autoCreateSecret) {
                    await this.createSecret(taskParameters);
                } else {
                    throw new Error(tl.loc('SecretNotFound'));
                }
            } else {
                throw new Error(tl.loc('SecretUpdateFailed', err));
            }
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private static secretsManagerClient: SecretsManager;

    private static async updateSecret(taskParameters: Parameters.TaskParameters): Promise<void> {

        console.log(tl.loc('UpdatingSecret', taskParameters.secretNameOrId));

        // treat updating descrption et al about the secret as distinct from a value update
        if (taskParameters.description || taskParameters.kmsKeyId) {
            const updateMetaRequest: SecretsManager.UpdateSecretRequest = {
                SecretId: taskParameters.secretNameOrId,
                Description: taskParameters.description,
                KmsKeyId: taskParameters.kmsKeyId
            };

            await this.secretsManagerClient.updateSecret(updateMetaRequest).promise();
        }

        const updateValueRequest: SecretsManager.PutSecretValueRequest = {
            SecretId: taskParameters.secretNameOrId
        };

        if (taskParameters.secretValueSource === Parameters.TaskParameters.inlineSecretSource) {
            updateValueRequest.SecretString = taskParameters.secretValue;
        } else {
            switch (taskParameters.secretValueType) {
                case Parameters.TaskParameters.stringSecretType: {
                    updateValueRequest.SecretString = fs.readFileSync(taskParameters.secretValueFile, 'utf8');
                }
                break;

                case Parameters.TaskParameters.binarySecretType: {
                    updateValueRequest.SecretBinary = fs.readFileSync(taskParameters.secretValueFile);
                }
                break;
            }
        }

        const response = await this.secretsManagerClient.putSecretValue(updateValueRequest).promise();

        if (taskParameters.arnOutputVariable) {
            console.log(tl.loc('SettingArnOutputVariable', taskParameters.arnOutputVariable));
            tl.setVariable(taskParameters.arnOutputVariable, response.ARN);
        }

        if (taskParameters.versionIdOutputVariable) {
            console.log(tl.loc('SettingVersionIdOutputVariable', taskParameters.versionIdOutputVariable));
            tl.setVariable(taskParameters.versionIdOutputVariable, response.VersionId);
        }
    }

    private static async createSecret(taskParameters: Parameters.TaskParameters): Promise<void> {
        console.log(tl.loc('SecretNotFoundAutoCreating'));

        const request: SecretsManager.CreateSecretRequest = {
            Name: taskParameters.secretNameOrId,
            KmsKeyId: taskParameters.kmsKeyId,
            Description: taskParameters.description
        };

        if (taskParameters.secretValueSource === Parameters.TaskParameters.inlineSecretSource) {
            request.SecretString = taskParameters.secretValue;
        } else {
            switch (taskParameters.secretValueType) {
                case Parameters.TaskParameters.stringSecretType: {
                    request.SecretString = fs.readFileSync(taskParameters.secretValueFile, 'utf8');
                }
                break;

                case Parameters.TaskParameters.binarySecretType: {
                    request.SecretBinary = fs.readFileSync(taskParameters.secretValueFile);
                }
                break;
            }
        }

        if (taskParameters.tags) {
            request.Tags = this.getTags(taskParameters.tags);
        }

        const response = await this.secretsManagerClient.createSecret(request).promise();

        if (taskParameters.arnOutputVariable) {
            console.log(tl.loc('SettingArnOutputVariable', taskParameters.arnOutputVariable));
            tl.setVariable(taskParameters.arnOutputVariable, response.ARN);
        }

        if (taskParameters.versionIdOutputVariable) {
            console.log(tl.loc('SettingVersionIdOutputVariable', taskParameters.versionIdOutputVariable));
            tl.setVariable(taskParameters.versionIdOutputVariable, response.VersionId);
        }
    }

    private static getTags(tags: string[]): SecretsManager.Tag[] {

        let arr: SecretsManager.Tag[];

        if (tags && tags.length > 0) {
            arr = [];
            tags.forEach((t) => {
                const kvp = t.split('=');
                const key = kvp[0].trim();
                const val = kvp[1].trim();
                console.log(tl.loc('AddingTag', key, val));
                arr.push({
                    Key: key,
                    Value: val
                });
            });
        }

        return arr;
    }

    private static async createServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const opts: SecretsManager.ClientConfiguration = {
            apiVersion: '2017-10-17',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };

        this.secretsManagerClient = sdkutils.createAndConfigureSdkClient(SecretsManager, opts, taskParameters, tl.debug);
    }

}
