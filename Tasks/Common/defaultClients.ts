/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { S3, SecretsManager, SSM } from 'aws-sdk/clients/all'
import { SdkUtils } from 'Common/sdkutils'
import { AWSConnectionParameters  } from './awsConnectionParameters'

interface GenericClientConfiguration {
    awsConnectionParameters: AWSConnectionParameters
}

interface S3ClientConfiguration extends GenericClientConfiguration {
    forcePathStyleAddressing: boolean
}

export async function createDefaultS3(
    configuration: S3ClientConfiguration,
    logger: (msg: string) => void): Promise<S3>  {
    const s3Opts: S3.ClientConfiguration = {
        apiVersion: '2006-03-01',
        s3ForcePathStyle: configuration.forcePathStyleAddressing
    }

    // tslint:disable-next-line: no-unsafe-any
    return await SdkUtils.createAndConfigureSdkClient(
        S3,
        s3Opts,
        configuration.awsConnectionParameters,
        logger) as S3
}

export async function createDefaultSecretsManager(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void): Promise<SecretsManager> {
    const opts: SecretsManager.ClientConfiguration = {
        apiVersion: '2017-10-17'
    }

    // tslint:disable-next-line: no-unsafe-any
    return await SdkUtils.createAndConfigureSdkClient(
        SecretsManager,
        opts,
        configuration.awsConnectionParameters,
        logger) as SecretsManager
}

export async function createDefaultSSM(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void): Promise<SSM> {
    const ssmOpts: SSM.ClientConfiguration = {
        apiVersion: '2014-11-06'
    }

    return await SdkUtils.createAndConfigureSdkClient(
        SSM,
        ssmOpts,
        configuration,
        logger) as SSM
}
