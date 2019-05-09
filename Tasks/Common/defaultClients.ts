/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3 } from 'aws-sdk/clients/all'
import { SdkUtils } from 'Common/sdkutils'
import { AWSConnectionParameters  } from './sdkutils/awsConnectionParameters'

export async function createDefaultS3Client(
    connectionParams: AWSConnectionParameters,
    forcePathStyle: boolean,
    logger: (msg: string) => void): Promise<S3>  {
    const s3Opts: S3.ClientConfiguration = {
        apiVersion: '2006-03-01',
        s3ForcePathStyle: forcePathStyle
    }

    return await SdkUtils.createAndConfigureSdkClient(S3, s3Opts, connectionParams, logger) as S3
}
