/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

// Task variable names that can be used to supply the AWS credentials
// to a task (in addition to using a service endpoint, or environment
// variables, or EC2 instance metadata)
import * as tl from 'azure-pipelines-task-lib'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { format, parse, Url } from 'url'
import { Credentials } from '@aws-sdk/types'

export const credentialsType = 'credentialsType'
export const credentialsTypeEnvironment = 'environment'
export const credentialsTypeServiceConnection = 'serviceConnection'

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
    proxyConfiguration: Url | undefined
    credentials: Credentials | undefined
    region: string | undefined
}

// Discover any configured proxy setup, first using the Agent.ProxyUrl and related variables.
// If those are not set, fall back to checking HTTP(s)_PROXY that some customers are using
// instead. If HTTP(s)_PROXY is in use we deconstruct the url to make up a ProxyConfiguration
// instance, and then reform to configure the SDK. This allows us to work with either approach.
function setupProxy(proxyConfiguration: tl.ProxyConfiguration | string): Url | undefined {
    try {
        if (typeof proxyConfiguration === 'string') {
            return parse(proxyConfiguration)
        } else {
            const config = proxyConfiguration
            const proxy = parse(config.proxyUrl)
            if (config.proxyUsername || config.proxyPassword) {
                proxy.auth = `${config.proxyUsername}:${config.proxyPassword}`
            }
            return proxy
        }
    } catch (err) {
        tl.warning(`Failed to process proxy configuration, error ${err}`)
        return undefined
    }
}

function getRegion(): string | undefined {
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
        console.log(`...configured to use region ${process.env.AWS_REGION}, defined in environment variable.`)

        return process.env.AWS_REGION
    }

    if (process.env.AWS_DEFAULT_REGION) {
        console.log(`...configured to use region ${process.env.AWS_DEFAULT_REGION}, defined in environment variable.`)

        return process.env.AWS_DEFAULT_REGION
    }
    console.log('No region specified in the task configuration or environment')
    return undefined
}

function configureCredentialsFromConnection(): Credentials | undefined {
    const credentialsEndpoint = tl.getInput('awsCredentials')
    if (!credentialsEndpoint) {
        throw Error('Task configured to use service connection credentials, but none configured!')
    }
    const endpointAuth = tl.getEndpointAuthorization(credentialsEndpoint, false)
    console.log(`...configuring AWS credentials from service endpoint '${credentialsEndpoint}'`)

    const accessKey = endpointAuth?.parameters?.username
    const secretKey = endpointAuth?.parameters?.password

    if (!accessKey || !secretKey) {
        return undefined
    }
    // TODO
    //const token = endpointAuth?.parameters?.sessionToken
    //const assumeRoleArn = endpointAuth?.parameters?.assumeRoleArn
    //const externalId = endpointAuth?.parameters?.externalId
    //const roleSessionName = endpointAuth?.parameters?.roleSessionName

    return {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
    }
}

function getCredentials(): Credentials | undefined {
    switch (tl.getVariable(credentialsType)) {
        case credentialsTypeEnvironment:
            console.log('Credentials will be configured from the environment')
            // TODO
            return undefined
        case credentialsTypeServiceConnection:
            console.log('Credentials will be configured from the service connection')
            return configureCredentialsFromConnection()
        default:
            return undefined
    }
}

export function buildConnectionParameters(): AWSConnectionParameters {
    let proxy = undefined
    const proxyConfiguration = tl.getHttpProxyConfiguration() ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
    if (proxyConfiguration) {
        proxy = setupProxy(proxyConfiguration)
    }

    return {
        proxyConfiguration: proxy,
        region: getRegion(),
        credentials: getCredentials()
    }
}
