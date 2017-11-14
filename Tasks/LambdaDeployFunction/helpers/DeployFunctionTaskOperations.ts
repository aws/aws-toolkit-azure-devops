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
import IAM = require('aws-sdk/clients/iam');
import Parameters = require('./DeployFunctionTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');
import { readFileSync } from 'fs';

export class TaskOperations {

    public static async deployFunction(taskParameters: Parameters.TaskParameters): Promise<void> {

        await this.createServiceClients(taskParameters);

        let functionArn: string;
        const functionExists = await this.testFunctionExists(taskParameters.functionName);
        switch (taskParameters.deploymentMode) {
            case taskParameters.deployCodeOnly: {
                if (functionExists) {
                    functionArn = await this.updateFunctionCode(taskParameters);
                } else {
                    throw new Error(tl.loc('FunctionNotFound', taskParameters.functionName));
                }
            }
            break;

            case taskParameters.deployCodeAndConfig: {
                if (functionExists) {
                    functionArn = await this.updateFunction(taskParameters);
                } else {
                    functionArn = await this.createFunction(taskParameters);
                }
            }
            break;

            default:
                throw new Error(`Unrecognized deployment mode ${taskParameters.deploymentMode}`);
        }

        if (taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable));
            tl.setVariable(taskParameters.outputVariable, functionArn);
        }

        console.log(tl.loc('TaskCompleted', taskParameters.functionName, functionArn));
    }

    private static lambdaClient: Lambda;
    private static iamClient: IAM;

    private static async createServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const lambdaOpts: Lambda.ClientConfiguration = {
            apiVersion: '2015-03-31',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };

        this.lambdaClient = sdkutils.createAndConfigureSdkClient(Lambda, lambdaOpts, taskParameters, tl.debug);

        const iamOpts: IAM.ClientConfiguration = {
            apiVersion: '2010-05-08',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };

        this.iamClient = sdkutils.createAndConfigureSdkClient(IAM, iamOpts, taskParameters, tl.debug);
    }

    private static async updateFunctionCode(taskParameters: Parameters.TaskParameters): Promise<string> {
        console.log(tl.loc('UpdatingFunctionCode', taskParameters.functionName));

        try {
            const updateCodeRequest: Lambda.UpdateFunctionCodeRequest = {
                FunctionName: taskParameters.functionName,
                Publish: taskParameters.publish
            };
            if (taskParameters.codeLocation === taskParameters.updateFromLocalFile) {
                updateCodeRequest.ZipFile = readFileSync(taskParameters.localZipFile);
            } else {
                updateCodeRequest.S3Bucket = taskParameters.s3Bucket;
                updateCodeRequest.S3Key = taskParameters.s3ObjectKey;
                updateCodeRequest.S3ObjectVersion = taskParameters.s3ObjectVersion;
            }

            const response = await this.lambdaClient.updateFunctionCode(updateCodeRequest).promise();
            return response.FunctionArn;
        } catch (err) {
            throw new Error('Error while updating function code: ' + err);
        }
    }

    private static async updateFunction(taskParameters: Parameters.TaskParameters): Promise<string> {
        console.log(tl.loc('UpdatingFunctionConfiguration', taskParameters.functionName));

        // Cannot update code and configuration at the same time. As 'publish' option is
        // only available when updating the code, do that last
        try {
            const updateConfigRequest: Lambda.UpdateFunctionConfigurationRequest = {
                FunctionName: taskParameters.functionName,
                Handler: taskParameters.functionHandler,
                Description: taskParameters.description,
                Role: await sdkutils.roleArnFromName(this.iamClient, taskParameters.roleARN),
                MemorySize: taskParameters.memorySize,
                Timeout: taskParameters.timeout,
                Runtime: taskParameters.runtime,
                KMSKeyArn: taskParameters.kmsKeyARN,
                DeadLetterConfig: {
                    TargetArn: taskParameters.deadLetterARN
                }
            };

            if (taskParameters.environment) {
                updateConfigRequest.Environment = {};
                updateConfigRequest.Environment.Variables = {};
                    taskParameters.environment.forEach((ev) => {
                    const parts = ev.split('=');
                    updateConfigRequest.Environment.Variables[`${parts[0].trim()}`] = parts[1].trim();
                });
            }
            if (taskParameters.securityGroups) {
                updateConfigRequest.VpcConfig = {
                    SecurityGroupIds: taskParameters.securityGroups,
                    SubnetIds: taskParameters.subnets
                };
            }
            if (taskParameters.tracingConfig !== 'XRay') {
                updateConfigRequest.TracingConfig = {
                    Mode: taskParameters.tracingConfig
                };
            }

            await this.lambdaClient.updateFunctionConfiguration(updateConfigRequest).promise();

            return await this.updateFunctionCode(taskParameters);
        } catch (err) {
            throw new Error('Error while updating function configuration: ' + err);
        }
    }

    private static async createFunction(taskParameters: Parameters.TaskParameters): Promise<string> {
        console.log(tl.loc('CreatingFunction', taskParameters.functionName));

        const request: Lambda.CreateFunctionRequest = {
            FunctionName: taskParameters.functionName,
            Handler: taskParameters.functionHandler,
            Description: taskParameters.description,
            Role: await sdkutils.roleArnFromName(this.iamClient, taskParameters.roleARN),
            MemorySize: taskParameters.memorySize,
            Timeout: taskParameters.timeout,
            Publish: taskParameters.publish,
            Runtime: taskParameters.runtime,
            Code: (taskParameters.codeLocation === taskParameters.updateFromLocalFile) ? {
                ZipFile: readFileSync(taskParameters.localZipFile)
            } : {
                S3Bucket: taskParameters.s3Bucket,
                S3Key: taskParameters.s3ObjectKey,
                S3ObjectVersion: taskParameters.s3ObjectVersion
            },
            DeadLetterConfig: {
                TargetArn: taskParameters.deadLetterARN
            },
            KMSKeyArn: taskParameters.kmsKeyARN
        };

        if (taskParameters.environment) {
            request.Environment = {};
            request.Environment.Variables = {};
            taskParameters.environment.forEach((ev) => {
                const parts = ev.split('=');
                request.Environment.Variables[`${parts[0].trim()}`] = parts[1].trim();
            });
        }
        if (taskParameters.tags) {
            request.Tags = {};
            taskParameters.tags.forEach((tv) => {
                const parts = tv.split('=');
                request.Tags[`${parts[0].trim()}`] = parts[1].trim();
            });
        }
        if (taskParameters.securityGroups) {
            request.VpcConfig = {
                SecurityGroupIds: taskParameters.securityGroups,
                SubnetIds: taskParameters.subnets
            };
        }
        if (taskParameters.tracingConfig !== 'XRay') {
            request.TracingConfig = {
                Mode: taskParameters.tracingConfig
            };
        }

        try {
            const response = await this.lambdaClient.createFunction(request).promise();
            return response.FunctionArn;
        } catch (err) {
            throw new Error('Failed to create function, error ' + err);
        }
    }

    private static async testFunctionExists(functionName: string): Promise<boolean> {
        try {
            const response = await this.lambdaClient.getFunction({
                FunctionName: functionName
            }).promise();
            return true;
        } catch (err) {
            return false;
        }
    }

}
