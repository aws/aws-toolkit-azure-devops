import tl = require('vsts-task-lib/task');
import path = require('path');
import awsLambdaClient = require('aws-sdk/clients/lambda');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async invokeFunction(taskParameters: TaskParameters.InvokeFunctionTaskParameters): Promise<void> {

        this.createServiceClients(taskParameters);

        await this.verifyResourcesExist(taskParameters.functionName);

        console.log(tl.loc('InvokingFunction', taskParameters.functionName));

        const params: awsLambdaClient.InvocationRequest = {
            FunctionName: taskParameters.functionName,
            InvocationType: taskParameters.invocationType,
            LogType: taskParameters.logType,
            Payload: JSON.stringify(taskParameters.payload)
        };
        try {
            const data: awsLambdaClient.InvocationResponse = await this.lambdaClient.invoke(params).promise();
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

    private static lambdaClient: awsLambdaClient;

    private static createServiceClients(taskParameters: TaskParameters.InvokeFunctionTaskParameters) {

        const lambdaConfig = {
            apiVersion: '2015-03-31',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };

       this.lambdaClient = new awsLambdaClient(lambdaConfig);
    }

    private static async verifyResourcesExist(functionName: string): Promise<void> {

        try {
            await this.lambdaClient.getFunctionConfiguration({ FunctionName: functionName}).promise();
        } catch (err) {
            throw new Error(tl.loc('FunctionDoesNotExist', functionName));
        }
    }
}
