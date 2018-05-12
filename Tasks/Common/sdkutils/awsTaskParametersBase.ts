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

    public readonly awsRegion: string;
    public readonly Credentials: AWS.Credentials;

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
            this.Credentials = new AWS.Credentials(
                {
                    accessKeyId: accessKey,
                    secretAccessKey: secretKey
                });
        } else {
            console.log(`Configuring task to use role-based credentials.`);

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
            if (externalId) {
                options.ExternalId = externalId;
            }

            this.Credentials = new AWS.TemporaryCredentials(options, masterCredentials);
        }

        // Discover any configured proxy setup, first using the Agent.ProxyUrl and related variables.
        // If those are not set, fall back to checking HTTP(s)_PROXY that some customers are using
        // instead. If HTTP(s)_PROXY is in use we deconstruct the url to make up a ProxyConfiguration
        // instance, and then reform to configure the SDK. This allows us to work with either approach.
        this.proxyConfiguration = tl.getHttpProxyConfiguration()
            || process.env.HTTPS_PROXY
            || process.env.HTTP_PROXY;

        if (this.proxyConfiguration) {
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
