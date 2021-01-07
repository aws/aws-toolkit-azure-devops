/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import IAM = require('aws-sdk/clients/iam')
import Lambda = require('aws-sdk/clients/lambda')
import * as tl from 'azure-pipelines-task-lib/task'
import { SdkUtils } from 'src/lib/sdkutils'
import { readFileSync } from 'fs'
import { deployCodeAndConfig, deployCodeOnly, TaskParameters, updateFromLocalFile } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly iamClient: IAM,
        public readonly lambdaClient: Lambda,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        let functionArn: string
        const functionExists = await this.testFunctionExists(this.taskParameters.functionName)
        switch (this.taskParameters.deploymentMode) {
            case deployCodeOnly:
                if (functionExists) {
                    functionArn = await this.updateFunctionCode()
                } else {
                    throw new Error(tl.loc('FunctionNotFound', this.taskParameters.functionName))
                }
                break

            case deployCodeAndConfig:
                if (functionExists) {
                    functionArn = await this.updateFunction()
                } else {
                    functionArn = await this.createFunction()
                }
                break

            default:
                throw new Error(`Unrecognized deployment mode ${this.taskParameters.deploymentMode}`)
        }

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable))
            tl.setVariable(this.taskParameters.outputVariable, functionArn)
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.functionName, functionArn))
    }

    private async updateFunctionCode(): Promise<string> {
        console.log(tl.loc('UpdatingFunctionCode', this.taskParameters.functionName))

        try {
            const updateCodeRequest: Lambda.UpdateFunctionCodeRequest = {
                FunctionName: this.taskParameters.functionName,
                Publish: this.taskParameters.publish
            }
            if (this.taskParameters.codeLocation === updateFromLocalFile) {
                updateCodeRequest.ZipFile = readFileSync(this.taskParameters.localZipFile)
            } else {
                updateCodeRequest.S3Bucket = this.taskParameters.s3Bucket
                updateCodeRequest.S3Key = this.taskParameters.s3ObjectKey
                updateCodeRequest.S3ObjectVersion = this.taskParameters.s3ObjectVersion
            }

            const response = await this.lambdaClient.updateFunctionCode(updateCodeRequest).promise()

            if (!response.FunctionArn) {
                throw new Error(tl.loc('NoFunctionArnReturned'))
            }

            return response.FunctionArn
        } catch (err) {
            throw new Error(`Error while updating function code: ${err}`)
        }
    }

    private async updateFunction(): Promise<string> {
        console.log(tl.loc('UpdatingFunctionConfiguration', this.taskParameters.functionName))

        // Cannot update code and configuration at the same time. As 'publish' option is
        // only available when updating the code, do that last
        try {
            const updateConfigRequest: Lambda.UpdateFunctionConfigurationRequest = {
                FunctionName: this.taskParameters.functionName,
                Handler: this.taskParameters.functionHandler,
                Role: await SdkUtils.roleArnFromName(this.iamClient, this.taskParameters.roleARN),
                MemorySize: this.taskParameters.memorySize,
                Timeout: this.taskParameters.timeout,
                Runtime: this.taskParameters.runtime,
                KMSKeyArn: this.taskParameters.kmsKeyARN,
                DeadLetterConfig: {
                    TargetArn: this.taskParameters.deadLetterARN
                }
            }

            if (this.taskParameters.description) {
                updateConfigRequest.Description = this.taskParameters.description
            }
            if (this.taskParameters.environment) {
                updateConfigRequest.Environment = {}
                updateConfigRequest.Environment.Variables = SdkUtils.getTagsDictonary(this.taskParameters.environment)
            }
            if (this.taskParameters.securityGroups) {
                updateConfigRequest.VpcConfig = {
                    SecurityGroupIds: this.taskParameters.securityGroups,
                    SubnetIds: this.taskParameters.subnets
                }
            }
            if (this.taskParameters.layers && this.taskParameters.layers.length > 0) {
                updateConfigRequest.Layers = this.taskParameters.layers
            }
            if (this.taskParameters.tracingConfig && this.taskParameters.tracingConfig !== 'XRay') {
                updateConfigRequest.TracingConfig = {
                    Mode: this.taskParameters.tracingConfig
                }
            }

            const response = await this.lambdaClient.updateFunctionConfiguration(updateConfigRequest).promise()

            if (!response.FunctionArn) {
                throw new Error(tl.loc('NoFunctionArnReturned'))
            }

            // Update tags if we have them
            const tags = SdkUtils.getTagsDictonary<Lambda.Tags>(this.taskParameters.tags)
            if (tags && Object.keys(tags).length > 0) {
                try {
                    const tagRequest: Lambda.TagResourceRequest = {
                        Resource: response.FunctionArn,
                        Tags: tags
                    }
                    await this.lambdaClient.tagResource(tagRequest).promise()
                } catch (e) {
                    tl.warning(`${e}`)
                }
            }

            return await this.updateFunctionCode()
        } catch (err) {
            throw new Error(`Error while updating function configuration: ${err}`)
        }
    }

    private async createFunction(): Promise<string> {
        console.log(tl.loc('CreatingFunction', this.taskParameters.functionName))

        const request: Lambda.CreateFunctionRequest = {
            FunctionName: this.taskParameters.functionName,
            Handler: this.taskParameters.functionHandler,
            Role: await SdkUtils.roleArnFromName(this.iamClient, this.taskParameters.roleARN),
            MemorySize: this.taskParameters.memorySize,
            Timeout: this.taskParameters.timeout,
            Publish: this.taskParameters.publish,
            Runtime: this.taskParameters.runtime,
            Code:
                this.taskParameters.codeLocation === updateFromLocalFile
                    ? {
                          ZipFile: readFileSync(this.taskParameters.localZipFile)
                      }
                    : {
                          S3Bucket: this.taskParameters.s3Bucket,
                          S3Key: this.taskParameters.s3ObjectKey,
                          S3ObjectVersion: this.taskParameters.s3ObjectVersion
                      },
            DeadLetterConfig: {
                TargetArn: this.taskParameters.deadLetterARN
            },
            KMSKeyArn: this.taskParameters.kmsKeyARN
        }

        if (this.taskParameters.description) {
            request.Description = this.taskParameters.description
        }
        if (this.taskParameters.environment) {
            request.Environment = {}
            request.Environment.Variables = SdkUtils.getTagsDictonary(this.taskParameters.environment)
        }
        if (this.taskParameters.tags && this.taskParameters.tags.length > 0) {
            request.Tags = SdkUtils.getTagsDictonary(this.taskParameters.tags)
        }
        if (this.taskParameters.layers && this.taskParameters.layers.length > 0) {
            request.Layers = this.taskParameters.layers
        }
        if (this.taskParameters.securityGroups && this.taskParameters.securityGroups.length > 0) {
            request.VpcConfig = {
                SecurityGroupIds: this.taskParameters.securityGroups,
                SubnetIds: this.taskParameters.subnets
            }
        }
        if (this.taskParameters.tracingConfig && this.taskParameters.tracingConfig !== 'XRay') {
            request.TracingConfig = {
                Mode: this.taskParameters.tracingConfig
            }
        }

        try {
            const response = await this.lambdaClient.createFunction(request).promise()

            if (!response.FunctionArn) {
                throw new Error(tl.loc('NoFunctionArnReturned'))
            }

            return response.FunctionArn
        } catch (err) {
            throw new Error(`Failed to create function, error ${err}`)
        }
    }

    private async testFunctionExists(functionName: string): Promise<boolean> {
        try {
            const response = await this.lambdaClient
                .getFunction({
                    FunctionName: functionName
                })
                .promise()

            return true
        } catch (err) {
            return false
        }
    }
}
