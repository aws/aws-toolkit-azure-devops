/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import Lambda = require('aws-sdk/clients/lambda');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './InvokeFunctionTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {

        await this.createServiceClients();

        await this.verifyResourcesExist(this.taskParameters.functionName);

        console.log(tl.loc('InvokingFunction', this.taskParameters.functionName));

        const params: Lambda.InvocationRequest = {
            FunctionName: this.taskParameters.functionName,
            InvocationType: this.taskParameters.invocationType,
            LogType: this.taskParameters.logType,
            Payload: JSON.stringify(this.taskParameters.payload)
        };
        try {
            const data: Lambda.InvocationResponse = await this.lambdaClient.invoke(params).promise();
            if (this.taskParameters.outputVariable) {
                const outValue: string = data.Payload.toString();

                // don't echo the value into the normal logs in case it contains sensitive data
                tl.debug(tl.loc('ReceivedOutput', outValue));

                if (this.taskParameters.outputVariable) {
                    console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable));
                    tl.setVariable(this.taskParameters.outputVariable, outValue);
                }
            }

            console.log(tl.loc('TaskCompleted', this.taskParameters.functionName));
        } catch (err) {
            console.error(tl.loc('FunctionInvokeFailed'), err);
            throw err;
        }
    }

    private lambdaClient: Lambda;

    private async createServiceClients(): Promise<void> {

        const lambdaOpts: Lambda.ClientConfiguration = {
            apiVersion: '2015-03-31',
            credentials: this.taskParameters.Credentials,
            region: this.taskParameters.awsRegion
        };

       this.lambdaClient = SdkUtils.createAndConfigureSdkClient(Lambda, lambdaOpts, this.taskParameters, tl.debug);
    }

    private async verifyResourcesExist(functionName: string): Promise<void> {

        try {
            await this.lambdaClient.getFunctionConfiguration({ FunctionName: functionName}).promise();
        } catch (err) {
            throw new Error(tl.loc('FunctionDoesNotExist', functionName));
        }
    }
}
