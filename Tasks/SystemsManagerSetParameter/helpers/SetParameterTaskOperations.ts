/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SSM = require('aws-sdk/clients/ssm');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './SetParameterTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        await this.createServiceClients();

        // to avoid a security breach if someone tries to rewrite a secure string as a plain
        // value, test for existence and type and force a secure update if necessary
        const forceAsSecureString = await this.testParameterExistsAndIsSecureStringType(this.taskParameters.parameterName);
        await this.createOrUpdateParameter(forceAsSecureString);

        console.log(tl.loc('TaskCompleted'));
    }

    private ssmClient: SSM;

    private async createServiceClients(): Promise<void> {

        const ssmOpts: SSM.ClientConfiguration = {
            apiVersion: '2014-11-06'
        };
        this.ssmClient = await SdkUtils.createAndConfigureSdkClient(SSM, ssmOpts, this.taskParameters, tl.debug);
    }

    private async createOrUpdateParameter(forceAsSecureString: boolean): Promise<void> {

        try {
            await this.ssmClient.putParameter({
                Name: this.taskParameters.parameterName,
                Type: forceAsSecureString ? 'SecureString' : this.taskParameters.parameterType,
                Value: this.taskParameters.parameterValue,
                Overwrite: true,
                KeyId: this.taskParameters.encryptionKeyId
            }).promise();
        } catch (error) {
            throw new Error(tl.loc('CreateOrUpdateFailed', error));
        }
    }

    private async testParameterExistsAndIsSecureStringType(parameterName: string): Promise<boolean> {

        let result: boolean = false;

        try {
            const response = await this.ssmClient.getParameter({
                Name: parameterName
            }).promise();

            result = response.Parameter.Type === TaskParameters.secureStringType;
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
