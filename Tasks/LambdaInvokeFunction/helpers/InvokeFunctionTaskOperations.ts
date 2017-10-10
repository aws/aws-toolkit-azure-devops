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
import Parameters = require('./InvokeFunctionTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async invokeFunction(taskParameters: Parameters.TaskParameters): Promise<void> {

        this.createServiceClients(taskParameters);

        await this.verifyResourcesExist(taskParameters.functionName);

        console.log(tl.loc('InvokingFunction', taskParameters.functionName));

        const params: Lambda.InvocationRequest = {
            FunctionName: taskParameters.functionName,
            InvocationType: taskParameters.invocationType,
            LogType: taskParameters.logType,
            Payload: JSON.stringify(taskParameters.payload)
        };
        try {
            const data: Lambda.InvocationResponse = await this.lambdaClient.invoke(params).promise();
            if (taskParameters.outputVariable) {
                const outValue: string = data.Payload.toString();

                // don't echo the value into the normal logs in case it contains sensitive data
                tl.debug(tl.loc('ReceivedOutput', outValue));

                if (taskParameters.outputVariable) {
                    console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable));
                    tl.setVariable(taskParameters.outputVariable, outValue);
                }
            }

            console.log(tl.loc('TaskCompleted', taskParameters.functionName));
        } catch (err) {
            console.error(tl.loc('FunctionInvokeFailed'), err);
            throw err;
        }
    }

    private static lambdaClient: Lambda;

    private static createServiceClients(taskParameters: Parameters.TaskParameters) {

        const lambdaOpts: Lambda.ClientConfiguration = {
            apiVersion: '2015-03-31',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };

       this.lambdaClient = sdkutils.createAndConfigureSdkClient(Lambda, lambdaOpts, taskParameters, tl.debug);
    }

    private static async verifyResourcesExist(functionName: string): Promise<void> {

        try {
            await this.lambdaClient.getFunctionConfiguration({ FunctionName: functionName}).promise();
        } catch (err) {
            throw new Error(tl.loc('FunctionDoesNotExist', functionName));
        }
    }
}
