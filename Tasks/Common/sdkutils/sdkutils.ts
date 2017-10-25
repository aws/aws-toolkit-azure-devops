/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import STS = require('aws-sdk/clients/sts');
import AWS = require('aws-sdk/global');

export abstract class AWSTaskParametersBase {

    public readonly awsRegion: string;

    // Optional diagnostic logging switches
    public readonly logRequestData: boolean;
    public readonly logResponseData: boolean;

    // Original task credentials configured by the task user; if we are in assume-role
    // mode, these credentials were used to generate the temporary credential
    // fields above
    protected awsEndpointAuth: tl.EndpointAuthorization;

    public readonly Credentials: AWS.Credentials;

    // If set, the task should expect to receive temporary session credentials
    // scoped to the role.
    public AssumeRoleARN: string;

    // default session name to apply to the generated credentials if not overridden
    // in the endpoint definition
    protected readonly defaultRoleSessionName: string = 'aws-vsts-tools';
    // The minimum duration, 15mins, should be enough for a task
    protected readonly minDuration: number = 900;
    protected readonly maxduration: number = 3600;
    protected readonly defaultRoleDuration: number = this.minDuration;
    // To have a longer duration, users can set this variable in their build or
    // release definitions to the required duration (in seconds, min 900 max 3600).
    protected readonly roleCredentialMaxDurationVariableName: string = 'aws.rolecredential.maxduration';

    protected constructor() {
        // credentials will be obtained or generated from the endpoint authorization
        // when we actually need them
        const awsEndpoint = tl.getInput('awsCredentials', true);
        this.awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);

        this.awsRegion = tl.getInput('regionName', true);

        this.logRequestData = tl.getBoolInput('logRequest', false);
        this.logResponseData = tl.getBoolInput('logResponse', false);

        const accessKey = this.awsEndpointAuth.parameters.username;
        const secretKey = this.awsEndpointAuth.parameters.password;
        this.AssumeRoleARN = this.awsEndpointAuth.parameters.assumeRoleArn;
        if (!this.AssumeRoleARN) {
            console.log(`Task configured to use regular, non role, credentials`);
            this.Credentials = new AWS.Credentials(
                {
                    accessKeyId: accessKey,
                    secretAccessKey: secretKey
                });
        } else {
            console.log(`Task configured to use credentials scoped to role.`);
            let roleSessionName: string = this.awsEndpointAuth.parameters.roleSessionName;
            if (!roleSessionName) {
                roleSessionName = this.defaultRoleSessionName;
            }
            let duration: number = this.defaultRoleDuration;

            const customDurationVariable = tl.getVariable(this.roleCredentialMaxDurationVariableName);
            if (customDurationVariable) {
                try {
                    const customDuration = parseInt(customDurationVariable, 10);
                    if (customDuration >= this.minDuration && customDuration <= this.maxduration) {
                        throw new RangeError(`Invalid credential duration '${customDurationVariable}', minimum is ${this.minDuration}seconds, max ${this.maxduration}seconds`);
                    } else {
                        duration = customDuration;
                    }
                } catch (err) {
                    console.warn(`Ignoring invalid custom ${this.roleCredentialMaxDurationVariableName} setting due to error: ${err}`);
                }
            }

            const masterCredentials = new AWS.Credentials({
                accessKeyId: accessKey,
                secretAccessKey: secretKey
            });
            const options: STS.AssumeRoleRequest = {
                RoleArn: this.AssumeRoleARN,
                DurationSeconds: duration,
                RoleSessionName: roleSessionName
            };

            this.Credentials = new AWS.TemporaryCredentials(options, masterCredentials);
        }
    }
}

// Injects a custom user agent conveying extension version and task being run into the
// sdk so usage metrics can be tied to the tools.
export function setSdkUserAgentFromManifest(taskManifestFilePath: string) {

    if (fs.existsSync(taskManifestFilePath)) {
        const taskManifest = JSON.parse(fs.readFileSync(taskManifestFilePath, 'utf8'));
        const version = taskManifest.version;
        const userAgentString = 'AWS-VSTS/' +
                                version.Major + '.' + version.Minor + '.' + version.Patch +
                                ' exec-env/VSTS-' + taskManifest.name;

        (AWS as any).util.userAgent = () => {
            return userAgentString;
        };
    } else {
        console.warn(`Task manifest ${taskManifestFilePath} not found, cannot set custom user agent!`);
    }
}

// prefer Agent.TempDirectory but if not available due to use of a lower agent version
// (it was added in agent v2.115.0), fallback to using TEMP
export function getTempLocation() : string {
    let tempDirectory = tl.getVariable('Agent.TempDirectory');
    if (!tempDirectory) {
        tempDirectory = process.env.TEMP;
        console.log(`Agent.TempDirectory not available, falling back to TEMP location at ${tempDirectory}`);
    }

    return tempDirectory;
}

// Returns a new instance of a service client, having attached request handlers
// to enable tracing of request/response data if the task is so configured. The
// default behavior for all clients is to simply emit the service request ID
// to the task log.
export function createAndConfigureSdkClient(awsService: any,
                                            awsServiceOpts: any,
                                            taskParams: AWSTaskParametersBase,
                                            logger: (msg: string) => void): any {

    awsService.prototype.customizeRequests((request) => {

        const logRequestData = taskParams.logRequestData;
        const logResponseData = taskParams.logResponseData;
        const operation = request.operation;

        request.on('complete', (response) => {

            try {
                logger(`AWS ${operation} request ID: ${response.requestId}`);

                const httpRequest = response.request.httpRequest;
                const httpResponse = response.httpResponse;

                // Choosing to not log request or response body content at this stage, partly to avoid
                // having to detect and avoid streaming content or object uploads, and partly to avoid
                // the possibility of logging sensitive data
                if (logRequestData) {
                    logger(`---Request data for ${response.requestId}---`);
                    logger(`  Path: ${httpRequest.path}`);
                    logger('  Headers:');
                    Object.keys(httpRequest.headers).forEach((element) => {
                        logger(`    ${element}=${httpRequest.headers[element]}`);
                    });
                }

                if (logResponseData) {
                    logger(`---Response data for request ${response.requestId}---`);
                    logger(`  Status code: ${httpResponse.statusCode}`);
                    if (response.httpResponse.headers) {
                        logger(`  Headers:`);
                        for (const k of Object.keys(httpResponse.headers)) {
                            logger(`    ${k}=${httpResponse.headers[k]}`);
                        }
                    }
                }
            } catch (err) {
                logger(`  Error inspecting request/response data, ${err}`);
            }
        });
    });

    return new awsService(awsServiceOpts);
}
