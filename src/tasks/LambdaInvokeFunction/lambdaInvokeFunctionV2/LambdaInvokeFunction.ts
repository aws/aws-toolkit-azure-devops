/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getInput, setResourcePath, TaskResult, setResult } from 'azure-pipelines-task-lib/task'
import { Lambda } from '@aws-sdk/client-lambda'
import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import { buildConnectionParameters } from 'lib/v2/awsConnectionParameters'
import { HttpsProxyAgent } from 'https-proxy-agent'
import path from 'path'

async function run(): Promise<void> {
    const taskManifestFile = path.join(__dirname, 'task.json')
    setResourcePath(taskManifestFile)

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
        // TODO
        defaultUserAgentProvider: async () => {
            return [['abc', '1']]
        }
    })

    const functionName = getInput('functionName', true) ?? ''
    const payload = getInput('payload')
    const invocationType = getInput('invocationType')
    const LogType = getInput('logType', false)

    await client.invoke({
        FunctionName: functionName,
        Payload: new TextEncoder().encode(payload),
        InvocationType: invocationType,
        LogType: LogType
    })
}

run()
    .then(result => {
        setResult(TaskResult.Succeeded, '')
    })
    .catch(error => {
        setResult(TaskResult.Failed, `${error}`)
    })
