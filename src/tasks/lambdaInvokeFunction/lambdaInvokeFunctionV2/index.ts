/*!
 * Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { Lambda } from '@aws-sdk/client-lambda'

function abc() {
    const client = new Lambda({})
    client.config.customUserAgent = 'abc'
}
