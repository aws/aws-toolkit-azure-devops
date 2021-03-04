/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters } from 'lib/awsConnectionParameters'
import { mkdirp, mkdtemp } from 'fs-extra'
import { tmpdir } from 'os'
import * as path from 'path'

export const emptyConnectionParameters: AWSConnectionParameters = {
    proxyConfiguration: '',
    AssumeRoleARN: '',
    logRequestData: false,
    logResponseData: false,
    awsEndpointAuth: {
        parameters: {},
        scheme: ''
    }
}

export async function makeTemporaryFolder(...relativePathParts: string[]): Promise<string> {
    if (relativePathParts.length === 0) {
        relativePathParts.push('awsazdotest')
    }

    const tmpPath = path.join(tmpdir(), ...relativePathParts)
    const tmpPathParent = path.dirname(tmpPath)
    await mkdirp(tmpPathParent)

    return await mkdtemp(tmpPath)
}
