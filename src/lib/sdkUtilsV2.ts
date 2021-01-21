/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib'
import * as path from 'path'

export function setup(): void {
    const taskManifestFile = path.join(__dirname, 'task.json')
    tl.setResourcePath(taskManifestFile)
    setSdkUserAgentFromManifest(taskManifestFile)
}

// Injects a custom user agent conveying extension version and task being run into the
// sdk so usage metrics can be tied to the tools.
function setSdkUserAgentFromManifest(taskManifestFilePath: string): void {
    // TODO
}

function getEndpointConfiguration() {
    const type = tl.getVariable('credentialsType')
    switch (type) {
        case 'environment':
            break
        case 'serviceConnection':
            break
        case undefined:
            throw Error('abc!!!!')
    }
}

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
