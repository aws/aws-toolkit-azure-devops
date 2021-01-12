/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ClientDefaults, Lambda } from '@aws-sdk/client-lambda'
import { S3 } from '@aws-sdk/client-s3'

function setClientVersion(): ClientDefaults {
    return {
        region: '',
        defaultUserAgentProvider: async () => {
            return [['abc', '1']]
        }
    }
}

function abc() {
    const client = new Lambda(setClientVersion())
    const client2 = new S3({ region: '' })
    client2.createBucket({ Bucket: 'b' })
    client.config.customUserAgent = [['abc', '1']]
}

abc()
