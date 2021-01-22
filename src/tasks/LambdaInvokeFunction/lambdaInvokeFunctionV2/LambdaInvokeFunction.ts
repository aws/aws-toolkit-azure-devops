/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ClientDefaults, Lambda } from '@aws-sdk/client-lambda'
import { S3 } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import proxy from 'proxy-agent'

function setClientVersion(): ClientDefaults {
    proxy({ timeout: 1000 })
    return {
        region: '',
        defaultUserAgentProvider: async () => {
            return [['abc', '1']]
        },

        requestHandler: new NodeHttpHandler({
            httpAgent: proxy('https://example.com'),
            httpsAgent: proxy('https://example.com')
        })
    }
}

function abc() {
    const client = new Lambda(setClientVersion())
    new Lambda({ credentials: { accessKeyId: '33', secretAccessKey: '333' } })
    const client2 = new S3({ region: '' })
    client2.createBucket({ Bucket: 'b' })
    client.config.customUserAgent = [['abc', '1']]
}

abc()
