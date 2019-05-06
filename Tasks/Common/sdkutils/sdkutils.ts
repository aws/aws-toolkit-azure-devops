/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import IAM = require('aws-sdk/clients/iam')
import S3 = require('aws-sdk/clients/s3')
import AWS = require('aws-sdk/global')
import fs = require('fs')
import path = require('path')
import tl = require('vsts-task-lib/task')
import { AWSTaskParametersBase } from './awsTaskParametersBase'

export abstract class SdkUtils {

    private static readonly agentTempDirectoryVariable: string = 'Agent.TempDirectory'
    private static readonly userAgentPrefix: string = 'AWS-VSTS'
    private static readonly userAgentSuffix: string = 'exec-env/VSTS'
    private static readonly userAgentHeader: string = 'User-Agent'

    // set on the integration test server so we validate the agent is set
    // on all test builds that use sdk clients
    private static readonly validateUserAgentEnvVariable: string = 'AWSVSTSTesting_ValidateUserAgent'

    public static readResources(): void {
        const taskManifestFile = path.join(__dirname, 'task.json')
        tl.setResourcePath(taskManifestFile)
        SdkUtils.setSdkUserAgentFromManifest(taskManifestFile)
    }

    public static readResourcesFromRelativePath(relativeResourcePath: string): void {
        const taskManifestFile = path.join(__dirname, relativeResourcePath)
        tl.setResourcePath(taskManifestFile)
        SdkUtils.setSdkUserAgentFromManifest(taskManifestFile)
    }

    // Injects a custom user agent conveying extension version and task being run into the
    // sdk so usage metrics can be tied to the tools.
    public static setSdkUserAgentFromManifest(taskManifestFilePath: string): void {

        if (fs.existsSync(taskManifestFilePath)) {
            const taskManifest = JSON.parse(fs.readFileSync(taskManifestFilePath, 'utf8'))
            const version = taskManifest.version
            const userAgentString = `${this.userAgentPrefix}/${version.Major}.${version.Minor}.${version.Patch} ${this.userAgentSuffix}-${taskManifest.name}`;

            (AWS as any).util.userAgent = () => {
                return userAgentString;
            };
        } else {
            console.warn(`Task manifest ${taskManifestFilePath} not found, cannot set custom user agent!`)
        }
    }

    // prefer Agent.TempDirectory but if not available due to use of a lower agent version
    // (it was added in agent v2.115.0), fallback to using TEMP
    public static getTempLocation(): string {
        let tempDirectory = tl.getVariable(this.agentTempDirectoryVariable)
        if (!tempDirectory) {
            tempDirectory = process.env.TEMP
            console.log(`Agent.TempDirectory not available, falling back to TEMP location at ${tempDirectory}`)
        }

        return tempDirectory
    }

    // Returns a new instance of a service client, having attached request handlers
    // to enable tracing of request/response data if the task is so configured. The
    // default behavior for all clients is to simply emit the service request ID
    // to the task log.
    public static async createAndConfigureSdkClient(awsService: any,
                                                    awsServiceOpts: any,
                                                    taskParams: AWSTaskParametersBase,
                                                    logger: (msg: string) => void): Promise<any> {

        awsService.prototype.customizeRequests((request) => {

            const logRequestData = taskParams.logRequestData
            const logResponseData = taskParams.logResponseData
            const operation = request.operation

            request.on('complete', (response) => {

                try {
                    logger(`AWS ${operation} request ID: ${response.requestId}`)

                    const httpRequest = response.request.httpRequest
                    const httpResponse = response.httpResponse

                    // For integration testing we validate that the user agent string we rely on for
                    // usage metrics was set. An environment variable allows us to easily enable/disable
                    // validation across all build tests if needed instead of using a per-definition build
                    // variable. We validate the agent in all builds (so we catch an error from any test)
                    // but only output that we've done the check in one so as to not spam the output from all
                    // requests in all tests.
                    if (process.env[this.validateUserAgentEnvVariable]) {
                        const agent: string = httpRequest.headers[this.userAgentHeader]
                        if ((agent.startsWith(`${this.userAgentPrefix}/`))
                             && agent.includes(`${this.userAgentSuffix}-`)) {
                            // Note: only displays if system.debug variable set true on the build
                            logger(`User-Agent ${agent} validated successfully`)
                        } else {
                            throw new Error(`User-Agent was not configured correctly for tools: ${agent}`)
                        }
                    }

                    // Choosing to not log request or response body content at this stage, partly to avoid
                    // having to detect and avoid streaming content or object uploads, and partly to avoid
                    // the possibility of logging sensitive data
                    if (logRequestData) {
                        logger(`---Request data for ${response.requestId}---`)
                        logger(`  Path: ${httpRequest.path}`)
                        logger('  Headers:')
                        Object.keys(httpRequest.headers).forEach((element) => {
                            logger(`    ${element}=${httpRequest.headers[element]}`)
                        })
                    }

                    if (logResponseData) {
                        logger(`---Response data for request ${response.requestId}---`)
                        logger(`  Status code: ${httpResponse.statusCode}`)
                        if (response.httpResponse.headers) {
                            logger('  Headers:')
                            for (const k of Object.keys(httpResponse.headers)) {
                                logger(`    ${k}=${httpResponse.headers[k]}`)
                            }
                        }
                    }
                } catch (err) {
                    logger(`  Error inspecting request/response data, ${err}`)
                }
            })
        })

        // If not already set for the service, poke any obtained credentials and/or
        // region into the service options. If credentials remain undefined, the sdk
        // will attempt to auto-infer from the host environment variables or, if EC2,
        // instance metadata
        if (awsServiceOpts) {
            if (!awsServiceOpts.credentials) {
                awsServiceOpts.credentials = await taskParams.getCredentials()
            }
            if (!awsServiceOpts.region) {
                awsServiceOpts.region = await taskParams.getRegion()
            }

            return new awsService(awsServiceOpts)
        }

        return new awsService({
            credentials: await taskParams.getCredentials(),
            region: await taskParams.getRegion()
        })
    }

    public static async roleArnFromName(iamClient: IAM, roleName: string): Promise<string> {
        if (roleName.startsWith('arn:')) {
            return roleName
        }

        try {
            console.log(`Attempting to retrieve Amazon Resource Name (ARN) for role ${roleName}`)

            const response = await iamClient.getRole({
                RoleName: roleName
            }).promise()

            return response.Role.Arn
        } catch (err) {
            throw new Error(`Error while obtaining ARN: ${err}`)
        }
    }

    public static async getPresignedUrl(
        s3Client: S3,
        operation: string,
        bucketName: string,
        objectKey: string): Promise<string> {
        // use async call so we handle static vs instance credentials correctly
        return new Promise<string>((resolve, reject) => {
            s3Client.getSignedUrl(operation, {
                Bucket: bucketName,
                Key: objectKey
            },                    function(err: any, url: string) {
                if (err) {
                    console.log(`Failed to generate presigned url to template, error: ${err}`)
                    reject(err)
                } else {
                    console.log(`Generated url to template: ${url}`)
                    resolve(url)
                }
            })
        })
    }
}
