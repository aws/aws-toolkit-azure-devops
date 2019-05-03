/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import { parse, format, Url } from 'url';
import STS = require('aws-sdk/clients/sts');
import AWS = require('aws-sdk/global');
import HttpsProxyAgent = require('https-proxy-agent');

export abstract class AWSTaskParametersBase {

    // Task variable names that can be used to supply the AWS credentials
    // to a task (in addition to using a service endpoint, or environment
    // variables, or EC2 instance metadata)
    private static readonly awsAccessKeyIdVariable: string = 'AWS.AccessKeyID';
    private static readonly awsSecretAccessKeyVariable: string = 'AWS.SecretAccessKey';
    private static readonly awsSessionTokenVariable: string = 'AWS.SessionToken';

    // Task variable name that can be used to supply the region setting to
    // a task.
    private static readonly awsRegionVariable: string = 'AWS.Region';

    // pre-formatted url string, or vsts-task-lib/ProxyConfiguration
    public readonly proxyConfiguration: string | tl.ProxyConfiguration;

    // If set, the task should expect to receive temporary session credentials
    // scoped to the role.
    public AssumeRoleARN: string;

    // Optional diagnostic logging switches
    public readonly logRequestData: boolean;
    public readonly logResponseData: boolean;

    // Original task credentials configured by the task user; if we are in assume-role
    // mode, these credentials were used to generate the temporary credential
    // fields above
    protected awsEndpointAuth: tl.EndpointAuthorization;

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
        buildBase();
    }

    // This is a shim until the constructor can be removed and buildBase is called by every task parameter base
    protected constructor(shim: string) {
    }

    protected buildBase() {
        this.logRequestData = tl.getBoolInput('logRequest', false);
        this.logResponseData = tl.getBoolInput('logResponse', false);

        this.proxyConfiguration = tl.getHttpProxyConfiguration()
                                    || process.env.HTTPS_PROXY
                                    || process.env.HTTP_PROXY;
        this.completeProxySetup();
    }

    // Probes for credentials to be used by the executing task. Credentials
    // can be configured as a service endpoint (of type 'AWS'), or specified
    // using task variables. If we don't discover credentials inside the
    // Team Services environment we will assume they are set as either
    // environment variables on the build host (or, if the build host is
    // an EC2 instance, in instance metadata).
    public async getCredentials() : Promise<AWS.Credentials> {

        console.log('Configuring credentials for task');

        const credentials =
            this.attemptEndpointCredentialConfiguration(tl.getInput('awsCredentials', false))
                || this.attemptCredentialConfigurationFromVariables();
        if (credentials) {
            return credentials;
        }

        // at this point user either has to have credentials in environment vars or
        // ec2 instance metadata
        console.log('No credentials configured. The task will attempt to use credentials found in the build host environment.');

        return undefined;
    }

    // Unpacks credentials from the specified endpoint configuration, if defined
    private attemptEndpointCredentialConfiguration(endpointName: string) : AWS.Credentials {
        if (!endpointName) {
            return undefined;
        }

        this.awsEndpointAuth = tl.getEndpointAuthorization(endpointName, false);
        console.log(`...configuring AWS credentials from service endpoint '${endpointName}'`);

        const accessKey = this.awsEndpointAuth.parameters.username;
        const secretKey = this.awsEndpointAuth.parameters.password;

        this.AssumeRoleARN = this.awsEndpointAuth.parameters.assumeRoleArn;
        if (!this.AssumeRoleARN) {
            console.log(`...endpoint defines standard access/secret key credentials`);
            return new AWS.Credentials({
                accessKeyId: accessKey,
                secretAccessKey: secretKey
            });
        }

        console.log(`...endpoint defines role-based credentials for role ${this.AssumeRoleARN}.`);

        const externalId: string = this.awsEndpointAuth.parameters.externalId;
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
                console.warn(`...ignoring invalid custom ${this.roleCredentialMaxDurationVariableName} setting due to error: ${err}`);
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
        if (externalId) {
            options.ExternalId = externalId;
        }

        return new AWS.TemporaryCredentials(options, masterCredentials);
    }

    // credentials can also be set, using their environment variable names,
    // as variables set on the task or build - these do not appear to be
    // visible as environment vars for the AWS Node.js sdk to auto-recover
    // so treat as if a service endpoint had been set and return a credentials
    // instance.
    private attemptCredentialConfigurationFromVariables() : AWS.Credentials {
        const accessKey = tl.getVariable(AWSTaskParametersBase.awsAccessKeyIdVariable);
        if (!accessKey) {
            return undefined;
        }

        const secretKey = tl.getVariable(AWSTaskParametersBase.awsSecretAccessKeyVariable);
        if (!secretKey) {
            throw new Error ('AWS access key ID present in task variables but secret key value is missing; cannot configure task credentials.');
        }

        const token = tl.getVariable(AWSTaskParametersBase.awsSessionTokenVariable);

        console.log('...configuring AWS credentials from task variables');
        return new AWS.Credentials({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            sessionToken: token
        });
    }

    public async getRegion() : Promise<string> {

        console.log('Configuring region for task');

        let region = tl.getInput('regionName', false);
        if (region) {
            // lowercase it because the picker we know have can return mixed case
            // data if the user typed in a region whose prefix (US- etc) exists
            // already in the friendly text
            region = region.toLowerCase();
            console.log(`...configured to use region ${region}, defined in task.`);
            return region;
        }

        region = tl.getVariable(AWSTaskParametersBase.awsRegionVariable);
        if (region) {
            console.log(`...configured to use region ${region}, defined in task variable ${AWSTaskParametersBase.awsRegionVariable}.`);
            return region;
        }

        if (process.env.AWS_REGION) {
            region = process.env.AWS_REGION;
            console.log(`...configured to use region ${region}, defined in environment variable.`);
            return region;
        }

        try {
            region = await this.queryRegionFromMetadata();
            console.log(`...configured to use region ${region}, from EC2 instance metadata.`);
            return region;
        } catch (err) {
            console.log(`...error: failed to query EC2 instance metadata for region - ${err}`);
        }

        console.log('No region specified in the task configuration or environment');

        return undefined;
    }

    private async queryRegionFromMetadata(): Promise<string> {
        // SDK doesn't support discovery of region from EC2 instance metadata, so do it manually. We set
        // a timeout so that if the build host isn't EC2, we don't hang forever
        return new Promise<string>((resolve, reject) => {
            const metadataService = new AWS.MetadataService();
            metadataService.httpOptions.timeout = 5000;
                metadataService.request('/latest/dynamic/instance-identity/document', (err, data) => {
                    try {
                        if (err) {
                            throw err;
                        }

                        console.log('...received instance identity document from metadata');
                        const identity = JSON.parse(data);
                        if (identity.region) {
                            resolve(identity.region);
                        } else {
                            throw new Error('...region value not found in instance identity metadata');
                        }
                    } catch (err) {
                        reject(err);
                    }
                }
            );
        });
    }

    // Discover any configured proxy setup, first using the Agent.ProxyUrl and related variables.
    // If those are not set, fall back to checking HTTP(s)_PROXY that some customers are using
    // instead. If HTTP(s)_PROXY is in use we deconstruct the url to make up a ProxyConfiguration
    // instance, and then reform to configure the SDK. This allows us to work with either approach.
    private completeProxySetup() : void {
        if (!this.proxyConfiguration) {
            return;
        }

        let proxy: Url;
        try {
            if (typeof this.proxyConfiguration === 'string') {
                proxy = parse(this.proxyConfiguration);
            } else {
                const config = this.proxyConfiguration as tl.ProxyConfiguration;
                proxy = parse(config.proxyUrl);
                if (config.proxyUsername || config.proxyPassword) {
                    proxy.auth = `${config.proxyUsername}:${config.proxyPassword}`;
                }
            }

            // do not want any auth in the logged url
            tl.debug(`Configuring task for proxy host ${proxy.host}, protocol ${proxy.protocol}`);
            AWS.config.update({
                httpOptions: { agent: new HttpsProxyAgent(format(proxy)) }
            });
        } catch (err) {
            console.error(`Failed to process proxy configuration, error ${err}`);
        }
    }

    // For tasks that do not use the AWS SDK for Node.js, tests for the preferred
    // Agent.ProxyUrl and related settings being set and configures the HTTP(S)_PROXY
    // variables depending on the indicated protocol. Tasks that use the SDK are
    // configured automatically in the constructor above.
    // Note: some users rely on HTTP(S)_PROXY in their environment and do not set
    // their agents up as noted in https://github.com/Microsoft/vsts-agent/blob/master/docs/start/proxyconfig.md.
    // Therefore this task only updates the HTTP(s)_ environment variables if the task
    // returns proxy configuration data read from Agent.ProxyUrl et al.
    public async configureHttpProxyFromAgentProxyConfiguration(taskName: string): Promise<void> {
        const proxyConfig = tl.getHttpProxyConfiguration();
        if (!proxyConfig) {
            return;
        }

        const proxy = parse(proxyConfig.proxyUrl);
        if (proxyConfig.proxyUsername || proxyConfig.proxyPassword) {
            proxy.auth = `${proxyConfig.proxyUsername}:${proxyConfig.proxyPassword}`;
        }
        const proxyUrl = format(proxy);
        // in case a user has HTTPS_ set, and not HTTP_ (or vice versa)
        // only set the specific variable corresponding to the protocol
        if (proxy.protocol === 'https:') {
            tl.debug(`${taskName} setting HTTPS_PROXY to host ${proxy.host}`);
            process.env.HTTPS_PROXY = proxyUrl;
        } else {
            tl.debug(`${taskName} setting HTTP_PROXY to host ${proxy.host}`);
            process.env.HTTP_PROXY = proxyUrl;
        }
    }
}
