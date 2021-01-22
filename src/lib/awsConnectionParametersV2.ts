/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as AWS from 'aws-sdkglobal'
// Task variable names that can be used to supply the AWS credentials
// to a task (in addition to using a service endpoint, or environment
// variables, or EC2 instance metadata)
import * as tl from 'azure-pipelines-task-lib'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { format, parse, Url } from 'url'

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
    AssumeRoleARN: string | undefined
    // credentails: Credentials | undefined
    //region:
    awsEndpointAuth: tl.EndpointAuthorization | undefined
}

// Discover any configured proxy setup, first using the Agent.ProxyUrl and related variables.
// If those are not set, fall back to checking HTTP(s)_PROXY that some customers are using
// instead. If HTTP(s)_PROXY is in use we deconstruct the url to make up a ProxyConfiguration
// instance, and then reform to configure the SDK. This allows us to work with either approach.
function completeProxySetup(proxyConfiguration: tl.ProxyConfiguration | string): Url | undefined {
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
        console.error(`Failed to process proxy configuration, error ${err}`)
        return undefined
    }
}

export function buildConnectionParameters(): AWSConnectionParameters {
    let proxy = undefined
    const proxyConfiguration = tl.getHttpProxyConfiguration() ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
    if (proxyConfiguration) {
        proxy = completeProxySetup(proxyConfiguration)
    }

    return {
        proxyConfiguration: proxy,
        AssumeRoleARN: undefined,
        awsEndpointAuth: undefined
    }
}
