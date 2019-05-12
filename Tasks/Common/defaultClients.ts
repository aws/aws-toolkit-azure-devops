/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3, SecretsManager } from 'aws-sdk/clients/all'
import { SdkUtils } from 'Common/sdkutils'
import { AWSConnectionParameters  } from './awsConnectionParameters'

interface S3ClientConfiguration {
    connectionParams: AWSConnectionParameters,
    forcePathStyle: boolean
}

interface GenericClientConfiguration {
    connectionParams: AWSConnectionParameters,
}

export async function createDefaultS3Client(
    configuration: S3ClientConfiguration,
    logger: (msg: string) => void): Promise<S3>  {
    const s3Opts: S3.ClientConfiguration = {
        apiVersion: '2006-03-01',
        s3ForcePathStyle: configuration.forcePathStyle
    }

    // tslint:disable-next-line: no-unsafe-any
    return await SdkUtils.createAndConfigureSdkClient(
        S3,
        s3Opts,
        configuration.connectionParams,
        logger) as S3
}

export async function createDefaultSecretsManager(
    connectionParams: GenericClientConfiguration,
    logger: (msg: string) => void): Promise<SecretsManager> {
    const opts: SecretsManager.ClientConfiguration = {
        apiVersion: '2017-10-17'
    }

    // tslint:disable-next-line: no-unsafe-any
    return await SdkUtils.createAndConfigureSdkClient(
        SecretsManager,
        opts,
        connectionParams,
        logger) as SecretsManager
}
