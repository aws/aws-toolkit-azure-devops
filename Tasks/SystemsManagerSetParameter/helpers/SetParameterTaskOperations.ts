/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SSM = require('aws-sdk/clients/ssm');
import Parameters = require('./SetParameterTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async setParameterValue(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.createServiceClients(taskParameters);

        // to avoid a security breach if someone tries to rewrite a secure string as a plain
        // value, test for existence and type and force a secure update if necessary
        const forceAsSecureString = await this.testParameterExistsAndIsSecureStringType(taskParameters.parameterName);
        await this.createOrUpdateParameter(taskParameters, forceAsSecureString);

        console.log(tl.loc('TaskCompleted'));
    }

    private static ssmClient: SSM;

    private static async createServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const ssmOpts: SSM.ClientConfiguration = {
            apiVersion: '2014-11-06',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.ssmClient = sdkutils.createAndConfigureSdkClient(SSM, ssmOpts, taskParameters, tl.debug);
    }

    private static async createOrUpdateParameter(taskParameters: Parameters.TaskParameters, forceAsSecureString: boolean): Promise<void> {

        try {
            await this.ssmClient.putParameter({
                Name: taskParameters.parameterName,
                Type: forceAsSecureString ? 'SecureString' : taskParameters.parameterType,
                Value: taskParameters.parameterValue,
                Overwrite: true,
                KeyId: taskParameters.encryptionKeyId
            }).promise();
        } catch (error) {
            throw new Error(tl.loc('CreateOrUpdateFailed', error));
        }
    }

    private static async testParameterExistsAndIsSecureStringType(parameterName: string): Promise<boolean> {

        let result: boolean = false;

        try {
            const response = await this.ssmClient.getParameter({
                Name: parameterName
            }).promise();

            result = response.Parameter.Type === Parameters.TaskParameters.secureStringType;
            if (result) {
                console.log(tl.loc('ParameterExistsAndIsSecureString', parameterName));
            } else {
                console.log(tl.loc('ParameterExistsAndIsNotSecureString', parameterName));
            }
        } catch (error) {
            if (error.code === 'ParameterNotFound') {
                console.log(tl.loc('ParameterDoesNotExist', parameterName));
            } else {
                throw new Error(tl.loc('ErrorTestingParameter', error));
            }
        }

        return result;
    }
}
