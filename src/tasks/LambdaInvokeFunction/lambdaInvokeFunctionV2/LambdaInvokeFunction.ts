/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { Lambda } from '@aws-sdk/client-lambda'
import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import * as tl from 'azure-pipelines-task-lib'
import { buildConnectionParameters } from 'lib/awsConnectionParametersV2'
import { HttpsProxyAgent } from 'https-proxy-agent'
import path from 'path'

async function run(): Promise<void> {
    const taskManifestFile = path.join(__dirname, 'task.json')
    tl.setResourcePath(taskManifestFile)
    const params = buildConnectionParameters()
    let proxyConfiguration = {}
    if (params.proxyConfiguration) {
        proxyConfiguration = {
            requestHandler: new NodeHttpHandler({
                httpsAgent: new HttpsProxyAgent(params.proxyConfiguration)
            })
        }
    }
    const client = new Lambda({
        credentials: params.credentials,
        region: params.region,
        ...proxyConfiguration,
        defaultUserAgentProvider: async () => {
            return [['abc', '1']]
        }
    })

    const functionName = tl.getInput('functionName', true) ?? ''
    const payload = tl.getInput('payload')
    const invocationType = tl.getInput('invocationType')
    const LogType = tl.getInput('logType', false)

    await client.invoke({
        FunctionName: functionName,
        Payload: new TextEncoder().encode(payload),
        InvocationType: invocationType,
        LogType: LogType
    })
}

run()
    .then(result => {
        tl.setResult(tl.TaskResult.Succeeded, '')
    })
    .catch(error => {
        tl.setResult(tl.TaskResult.Failed, `${error}`)
    })
