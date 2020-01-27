/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'

import { STS } from 'aws-sdk/clients/all'
import * as AWS from 'aws-sdk/global'
import * as HttpsProxyAgent from 'https-proxy-agent'
import { format, parse, Url } from 'url'

// Task variable names that can be used to supply the AWS credentials
// to a task (in addition to using a service endpoint, or environment
// variables, or EC2 instance metadata)
export const awsAccessKeyIdVariable: string = 'AWS.AccessKeyID'
export const awsSecretAccessKeyVariable: string = 'AWS.SecretAccessKey'
export const awsSessionTokenVariable: string = 'AWS.SessionToken'

// Task variable name that can be used to supply the region setting to
// a task.
export const awsRegionVariable: string = 'AWS.Region'

// default session name to apply to the generated credentials if not overridden
// in the endpoint definition
export const defaultRoleSessionName: string = 'aws-vsts-tools'
// The minimum duration, 15mins, should be enough for a task
export const minDuration: number = 900
export const maxduration: number = 3600
// To have a longer duration, users can set this variable in their build or
// release definitions to the required duration (in seconds, min 900 max 3600).
export const roleCredentialMaxDurationVariableName: string = 'aws.rolecredential.maxduration'

export interface AWSConnectionParameters {
    // pre-formatted url string, or azure-pipelines-task-lib/ProxyConfiguration
    proxyConfiguration: string | tl.ProxyConfiguration
    // If set, the task should expect to receive temporary session credentials
    // scoped to the role.
    AssumeRoleARN: string | undefined
    // Optional diagnostic logging switches
    logRequestData: boolean
    logResponseData: boolean
    // Original task credentials configured by the task user; if we are in assume-role
    // mode, these credentials were used to generate the temporary credential
    // fields above
    awsEndpointAuth: tl.EndpointAuthorization | undefined
}

// Discover any configured proxy setup, first using the Agent.ProxyUrl and related variables.
// If those are not set, fall back to checking HTTP(s)_PROXY that some customers are using
// instead. If HTTP(s)_PROXY is in use we deconstruct the url to make up a ProxyConfiguration
// instance, and then reform to configure the SDK. This allows us to work with either approach.
function completeProxySetup(connectionParamaters: AWSConnectionParameters): void {
    if (!connectionParamaters.proxyConfiguration) {
        return
    }

    let proxy: Url
    try {
        if (typeof connectionParamaters.proxyConfiguration === 'string') {
            proxy = parse(connectionParamaters.proxyConfiguration)
        } else {
            const config = connectionParamaters.proxyConfiguration as tl.ProxyConfiguration
            proxy = parse(config.proxyUrl)
            if (config.proxyUsername || config.proxyPassword) {
                proxy.auth = `${config.proxyUsername}:${config.proxyPassword}`
            }
        }

        // do not want any auth in the logged url
        tl.debug(`Configuring task for proxy host ${proxy.host}, protocol ${proxy.protocol}`)
        AWS.config.update({
            // tslint:disable-next-line: no-unsafe-any
            httpOptions: { agent: new HttpsProxyAgent(format(proxy)) }
        })
    } catch (err) {
        console.error(`Failed to process proxy configuration, error ${err}`)
    }
}

export function buildConnectionParameters(): AWSConnectionParameters {
    const connectionParameters: AWSConnectionParameters = {
        logRequestData: tl.getBoolInput('logRequest', false),
        logResponseData: tl.getBoolInput('logResponse', false),
        proxyConfiguration: tl.getHttpProxyConfiguration() || process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
        AssumeRoleARN: undefined,
        awsEndpointAuth: undefined
    }

    completeProxySetup(connectionParameters)

    return connectionParameters
}

// Unpacks credentials from the specified endpoint configuration, if defined
function attemptEndpointCredentialConfiguration(
    awsparams: AWSConnectionParameters,
    endpointName: string
): AWS.Credentials | undefined {
    if (!endpointName) {
        return undefined
    }

    awsparams.awsEndpointAuth = tl.getEndpointAuthorization(endpointName, false)
    console.log(`...configuring AWS credentials from service endpoint '${endpointName}'`)

    const accessKey = awsparams.awsEndpointAuth.parameters.username
    const secretKey = awsparams.awsEndpointAuth.parameters.password
    const token = awsparams.awsEndpointAuth.parameters.sessionToken
    awsparams.AssumeRoleARN = awsparams.awsEndpointAuth.parameters.assumeRoleArn
    if (!awsparams.AssumeRoleARN) {
        console.log('...endpoint defines standard access/secret key credentials')

        return new AWS.Credentials({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            sessionToken: token
        })
    }

    console.log(`...endpoint defines role-based credentials for role ${awsparams.AssumeRoleARN}.`)

    const externalId: string = awsparams.awsEndpointAuth.parameters.externalId
    let roleSessionName: string = awsparams.awsEndpointAuth.parameters.roleSessionName
    if (!roleSessionName) {
        roleSessionName = defaultRoleSessionName
    }
    let duration: number = minDuration

    const customDurationVariable = tl.getVariable(roleCredentialMaxDurationVariableName)
    if (customDurationVariable) {
        const customDuration = parseInt(customDurationVariable, 10)
        if (isNaN(customDuration) || customDuration < minDuration || customDuration > maxduration) {
            console.warn(
                `Invalid credential duration '${customDurationVariable}', minimum is ${minDuration}, max ${maxduration}`
            )
        } else {
            duration = customDuration
        }
    }

    const masterCredentials = new AWS.Credentials({
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        sessionToken: token
    })
    const options: STS.AssumeRoleRequest = {
        RoleArn: awsparams.AssumeRoleARN,
        DurationSeconds: duration,
        RoleSessionName: roleSessionName
    }
    if (externalId) {
        options.ExternalId = externalId
    }

    return new AWS.TemporaryCredentials(options, masterCredentials)
}

// credentials can also be set, using their environment variable names,
// as variables set on the task or build - these do not appear to be
// visible as environment vars for the AWS Node.js sdk to auto-recover
// so treat as if a service endpoint had been set and return a credentials
// instance.
function attemptCredentialConfigurationFromVariables(): AWS.Credentials | undefined {
    const accessKey = tl.getVariable(awsAccessKeyIdVariable)
    if (!accessKey) {
        return undefined
    }

    const secretKey = tl.getVariable(awsSecretAccessKeyVariable)
    if (!secretKey) {
        throw new Error(
            'AWS access key ID present in task variables but secret key value is missing; ' +
                'cannot configure task credentials.'
        )
    }

    const token = tl.getVariable(awsSessionTokenVariable)

    console.log('...configuring AWS credentials from task variables')

    return new AWS.Credentials({
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        sessionToken: token
    })
}

// Probes for credentials to be used by the executing task. Credentials
// can be configured as a service endpoint (of type 'AWS'), or specified
// using task variables. If we don't discover credentials inside the
// Team Services environment we will assume they are set as either
// environment variables on the build host (or, if the build host is
// an EC2 instance, in instance metadata).
export async function getCredentials(awsParams: AWSConnectionParameters): Promise<AWS.Credentials | undefined> {
    console.log('Configuring credentials for task')

    const credentials =
        attemptEndpointCredentialConfiguration(awsParams, tl.getInput('awsCredentials', false)) ||
        attemptCredentialConfigurationFromVariables()
    if (credentials) {
        return credentials
    }

    // at this point user either has to have credentials in environment vars or
    // ec2 instance metadata
    console.log(
        'No credentials configured.' + 'The task will attempt to use credentials found in the build host environment.'
    )

    return undefined
}

async function queryRegionFromMetadata(): Promise<string> {
    // SDK doesn't support discovery of region from EC2 instance metadata, so do it manually. We set
    // a timeout so that if the build host isn't EC2, we don't hang forever
    return new Promise<string>((resolve, reject) => {
        const metadataService = new AWS.MetadataService()
        metadataService.httpOptions.timeout = 5000
        metadataService.request('/latest/dynamic/instance-identity/document', (err, data) => {
            try {
                if (err) {
                    throw err
                }

                console.log('...received instance identity document from metadata')
                const identity = JSON.parse(data)
                // tslint:disable-next-line: no-unsafe-any
                if (identity.region) {
                    // tslint:disable-next-line: no-unsafe-any
                    resolve(identity.region)
                } else {
                    throw new Error('...region value not found in instance identity metadata')
                }
            } catch (err) {
                reject(err)
            }
        })
    })
}

export async function getRegion(): Promise<string> {
    console.log('Configuring region for task')

    let region = tl.getInput('regionName', false)
    if (region) {
        // lowercase it because the picker we know have can return mixed case
        // data if the user typed in a region whose prefix (US- etc) exists
        // already in the friendly text
        region = region.toLowerCase()
        console.log(`...configured to use region ${region}, defined in task.`)

        return region
    }

    region = tl.getVariable(awsRegionVariable)
    if (region) {
        console.log(`...configured to use region ${region}, defined in task variable ${awsRegionVariable}.`)

        return region
    }

    if (process.env.AWS_REGION) {
        region = process.env.AWS_REGION
        console.log(`...configured to use region ${region}, defined in environment variable.`)

        return region
    }

    try {
        region = await queryRegionFromMetadata()
        console.log(`...configured to use region ${region}, from EC2 instance metadata.`)

        return region
    } catch (err) {
        console.log(`...error: failed to query EC2 instance metadata for region - ${err}`)
    }

    console.log('No region specified in the task configuration or environment')

    return ''
}
