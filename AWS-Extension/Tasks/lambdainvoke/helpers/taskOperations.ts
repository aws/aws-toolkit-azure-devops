import tl = require('vsts-task-lib/task');
import path = require('path');
import awsLambdaClient = require('aws-sdk/clients/lambda');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async invokeFunction(taskParameters: TaskParameters.AwsLambdaInvokeTaskParameters): Promise<void> {

        const lambdaConfig = {
            apiVersion: '2015-03-31',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };

        const lambda = new awsLambdaClient(lambdaConfig);
        await TaskOperations.invoke(taskParameters, lambda);
    }

    private static async invoke(taskParameters: TaskParameters.AwsLambdaInvokeTaskParameters, lambda: awsLambdaClient): Promise<void> {

        const params: awsLambdaClient.InvocationRequest = {
            FunctionName: taskParameters.functionName,
            InvocationType: taskParameters.invocationType,
            LogType: taskParameters.logType,
            Payload: JSON.stringify(taskParameters.payload)
        };
        try {
            const data: awsLambdaClient.InvocationResponse = await lambda.invoke(params).promise();
            if (taskParameters.outputVariable) {
                const outValue: string = data.Payload.toString();
                console.log(`Setting output variable ${taskParameters.outputVariable} with the function output '${outValue}'`);
                tl.setVariable(taskParameters.outputVariable, outValue);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
