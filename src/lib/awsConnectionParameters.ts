/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'

import { STS } from 'aws-sdk/clients/all'
import * as AWS from 'aws-sdk/global'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { format, parse, Url } from 'url'
import { bool } from 'aws-sdk/clients/signer'
import { getOidcTokenForEndpoint } from './vstsUtils'

// Task variable names that can be used to supply the AWS credentials
// to a task (in addition to using a service endpoint, or environment
// variables, or EC2 instance metadata)
export const awsAccessKeyIdVariable = 'AWS.AccessKeyID'
export const awsSecretAccessKeyVariable = 'AWS.SecretAccessKey'
export const awsSessionTokenVariable = 'AWS.SessionToken'
export const awsAssumeRoleArnVariable = 'AWS.AssumeRoleArn'
export const awsExternalIdVariable = 'AWS.ExternalId'
export const awsRoleSessionNameVariable = 'AWS.RoleSessionName'

// Task variable name that can be used to supply the region setting to
// a task.
export const awsRegionVariable = 'AWS.Region'

// default session name to apply to the generated credentials if not overridden
// in the endpoint definition
export const defaultRoleSessionName = 'aws-vsts-tools'
// The minimum duration, 15mins, should be enough for a task
export const minDuration = 900
export const maxduration = 43200
// To have a longer duration, users can set this variable in their build or
// release definitions to the required duration (in seconds, min 900 max 43200).
export const roleCredentialMaxDurationVariableName = 'aws.rolecredential.maxduration'

export interface AWSConnectionParameters {
    // pre-formatted url string, or azure-pipelines-task-lib/ProxyConfiguration
    proxyConfiguration: string | tl.ProxyConfiguration | undefined
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
            const config = connectionParamaters.proxyConfiguration
            proxy = parse(config.proxyUrl)
            if (config.proxyUsername || config.proxyPassword) {
                proxy.auth = `${config.proxyUsername}:${config.proxyPassword}`
            }
        }

        // do not want any auth in the logged url
        tl.debug(`Configuring task for proxy host ${proxy.host}, protocol ${proxy.protocol}`)
        AWS.config.update({
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

function getEndpointAuthInfo(awsparams: AWSConnectionParameters, endpointName: string) {
    awsparams.awsEndpointAuth = tl.getEndpointAuthorization(endpointName, false)
    console.log(`...configuring AWS credentials from service endpoint '${endpointName}'`)
    const accessKey = awsparams.awsEndpointAuth?.parameters?.username
    const secretKey = awsparams.awsEndpointAuth?.parameters?.password
    if ((accessKey && !secretKey) || (!accessKey && secretKey)) {
        throw new Error('Need to define or omit both "Access Key ID" and "Secret Access Key", not just one.')
    }
    const token = awsparams.awsEndpointAuth?.parameters?.sessionToken
    let assumeRoleArn = awsparams.awsEndpointAuth?.parameters?.assumeRoleArn
    const externalId = awsparams.awsEndpointAuth?.parameters?.externalId
    const roleSessionName = awsparams.awsEndpointAuth?.parameters?.roleSessionName
    const endpointUsesOidcAuthScheme = awsparams.awsEndpointAuth?.scheme === 'None';

    if (endpointUsesOidcAuthScheme) {
        // The "role" parameter name was chosen for OIDC because that parameter
        // name is whitelisted from being masked out in build logs.
        assumeRoleArn = awsparams.awsEndpointAuth?.parameters?.role
    }
    return {
        accessKey: accessKey,
        secretKey: secretKey,
        token: token,
        assumeRoleArn: assumeRoleArn,
        externalId: externalId,
        roleSessionName: roleSessionName,
        oidcRoleName: awsparams.awsEndpointAuth?.parameters?.oidcRoleName,
        useOidc: endpointUsesOidcAuthScheme
    }
}

// Unpacks credentials from the specified endpoint configuration, if defined
async function attemptEndpointCredentialConfiguration(
    awsparams: AWSConnectionParameters,
    endpointName: string | undefined
): Promise<AWS.Credentials | undefined> {
    if (!endpointName) {
        return undefined
    }
    const authInfo = getEndpointAuthInfo(awsparams, endpointName)
    authInfo.accessKey = authInfo.accessKey ?? ''
    authInfo.secretKey = authInfo.secretKey ?? ''

    return createEndpointCredentials(
        authInfo.accessKey,
        authInfo.secretKey,
        authInfo.token,
        authInfo.assumeRoleArn,
        authInfo.externalId,
        authInfo.roleSessionName,
        authInfo.useOidc,
        endpointName
    )
}

// If only the role name to assume is set but no credentials,
// we try to assume the role directly
async function assumeRoleFromInstanceProfile(
    awsparams: AWSConnectionParameters,
    endpointName: string | undefined
): Promise<AWS.Credentials | undefined> {
    if (!endpointName) {
        return undefined
    }
    const authInfo = getEndpointAuthInfo(awsparams, endpointName)
    authInfo.roleSessionName = authInfo.roleSessionName ?? defaultRoleSessionName
    if (!authInfo.accessKey && !authInfo.secretKey && !authInfo.useOidc && authInfo.assumeRoleArn) {
        console.log('Assuming role without credentials (via instance profile)...')
        const params = {
            RoleArn: authInfo.assumeRoleArn,
            RoleSessionName: authInfo.roleSessionName
        }
        const sts = new STS()
        const data = await sts.assumeRole(params).promise()
        return new AWS.Credentials({
            accessKeyId: data.Credentials!.AccessKeyId,
            secretAccessKey: data.Credentials!.SecretAccessKey,
            sessionToken: data.Credentials!.SessionToken
        })
    }
    return undefined
}

// credentials can also be set, using their environment variable names,
// as variables set on the task or build - these do not appear to be
// visible as environment vars for the AWS Node.js sdk to auto-recover
// so treat as if a service endpoint had been set and return a credentials
// instance.
async function attemptCredentialConfigurationFromVariables(): Promise<AWS.Credentials | undefined> {
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
    const assumeRoleArn = tl.getVariable(awsAssumeRoleArnVariable)
    const externalId = tl.getVariable(awsExternalIdVariable)
    const roleSessionName = tl.getVariable(awsRoleSessionNameVariable)

    console.log('...configuring AWS credentials from task variables')

    return await createEndpointCredentials(accessKey, secretKey, token, assumeRoleArn, externalId, roleSessionName, false, undefined)
}

// Creates the AWS credentials to be used by the executing task.
async function createEndpointCredentials(
    accessKey: string,
    secretKey: string,
    token: string | undefined,
    assumeRoleARN: string | undefined,
    externalId: string | undefined,
    roleSessionName: string | undefined,
    useOidc: bool,
    endpointName: string | undefined
): Promise<AWS.Credentials> {
    if (!assumeRoleARN) {
        console.log('...endpoint defines standard access/secret key credentials')

        return new AWS.Credentials({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            sessionToken: token
        })
    }

    console.log(`...endpoint uses role-based access for role ${assumeRoleARN}.`)

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

    if (useOidc) {
        if (!endpointName) {
            throw new Error('No endpoint name provided for OIDC token retrieval')
        }
        const oidcToken = await getOidcTokenForEndpoint(endpointName);
        const oidcTokenParts = oidcToken.split('.');
        if (oidcTokenParts.length !== 3) {
            throw new Error('Invalid oidc token');
        }
        const oidcClaims = JSON.parse(Buffer.from(oidcTokenParts[1], 'base64').toString());

        // Log the OIDC token claims so users know how to configure AWS
        console.log("OIDC Token Subject: ", oidcClaims.sub);
        console.log("OIDC Token Issuer (Provider URL): ", oidcClaims.iss);
        console.log("OIDC Token Audience: ", oidcClaims.aud);

        console.log(`...assuming role ${assumeRoleARN} with OIDC token.`)
        return new AWS.WebIdentityCredentials({
            RoleArn: assumeRoleARN,
            WebIdentityToken: oidcToken,
            RoleSessionName: roleSessionName,
        });
    } else {
        console.log(`...assuming role ${assumeRoleARN} with access key credentials token.`)
        const masterCredentials = new AWS.Credentials({
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            sessionToken: token
        })
        const options: STS.AssumeRoleRequest = {
            RoleArn: assumeRoleARN,
            DurationSeconds: duration,
            RoleSessionName: roleSessionName
        }
        if (externalId) {
            options.ExternalId = externalId
        }
        return new AWS.TemporaryCredentials(options, masterCredentials)
    }
}

// Probes for credentials to be used by the executing task. Credentials
// can be configured as a service endpoint (of type 'AWS'), or specified
// using task variables. If we don't discover credentials inside the
// Team Services environment we will assume they are set as either
// environment variables on the build host (or, if the build host is
// an EC2 instance, in instance metadata).
export async function getCredentials(awsParams: AWSConnectionParameters): Promise<AWS.Credentials | undefined> {
    console.log('Configuring credentials for task')

    const role_credentials = await assumeRoleFromInstanceProfile(awsParams, tl.getInput('awsCredentials', false))
    if (typeof role_credentials !== 'undefined') {
        return role_credentials
    }

    const credentials =
        await attemptEndpointCredentialConfiguration(awsParams, tl.getInput('awsCredentials', false)) ||
        await attemptCredentialConfigurationFromVariables()
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
    const imdsOptions = { httpOptions: { timeout: 5000 }, maxRetries: 2 }

    const metadataService = new AWS.MetadataService(imdsOptions)

    let token: string

    try {
        token = await getImdsV2Token(metadataService)
    } catch {
        // set token to empty -- this will use IMDSv1 mechanism to fetch region
        token = ''
    }

    return await getRegionFromImds(metadataService, token)
}

/**
 * Attempts to get a Instance Metadata Service V2 token
 */
async function getImdsV2Token(metadataService: AWS.MetadataService): Promise<string> {
    console.log('Attempting to retrieve an IMDSv2 token.')

    return new Promise((resolve, reject) => {
        metadataService.request(
            '/latest/api/token',
            {
                method: 'PUT',
                headers: { 'x-aws-ec2-metadata-token-ttl-seconds': '21600' }
            },
            (err, token) => {
                if (err) {
                    reject(err)
                } else if (!token) {
                    reject(new Error('IMDS did not return a token.'))
                } else {
                    resolve(token)
                }
            }
        )
    })
}

/**
 * Attempts to get the region from the Instance Metadata Service
 */
async function getRegionFromImds(metadataService: AWS.MetadataService, token: string): Promise<string> {
    console.log('Retrieving the AWS region from the Instance Metadata Service (IMDS).')

    const options = token !== '' ? { headers: { 'x-aws-ec2-metadata-token': token } } : {}

    return new Promise((resolve, reject) => {
        metadataService.request(
            '/latest/dynamic/instance-identity/document',
            options,
            (err, instanceIdentityDocument) => {
                if (err) {
                    reject(err)
                } else if (!instanceIdentityDocument) {
                    reject(new Error('IMDS did not return an Instance Identity Document.'))
                } else {
                    try {
                        resolve(JSON.parse(instanceIdentityDocument).region)
                    } catch (e) {
                        reject(e)
                    }
                }
            }
        )
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
