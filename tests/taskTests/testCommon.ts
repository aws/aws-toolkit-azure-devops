/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters } from 'lib/awsConnectionParameters'

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
