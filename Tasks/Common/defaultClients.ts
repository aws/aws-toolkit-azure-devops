/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { Lambda, S3, SecretsManager, SNS, SQS } from 'aws-sdk/clients/all'
import { SdkUtils } from 'Common/sdkutils'
import { AWSConnectionParameters } from './awsConnectionParameters'

interface GenericClientConfiguration {
    awsConnectionParameters: AWSConnectionParameters
}

interface S3ClientConfiguration extends GenericClientConfiguration {
    forcePathStyleAddressing: boolean
}

export async function createDefaultS3(
    configuration: S3ClientConfiguration,
    logger: (msg: string) => void
): Promise<S3> {
    const s3Opts: S3.ClientConfiguration = {
        apiVersion: '2006-03-01',
        s3ForcePathStyle: configuration.forcePathStyleAddressing
    }

    // tslint:disable-next-line: no-unsafe-any
    return (await SdkUtils.createAndConfigureSdkClient(S3, s3Opts, configuration.awsConnectionParameters, logger)) as S3
}

export async function createDefaultSecretsManager(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<SecretsManager> {
    const opts: SecretsManager.ClientConfiguration = {
        apiVersion: '2017-10-17'
    }

    // tslint:disable-next-line: no-unsafe-any
    return (await SdkUtils.createAndConfigureSdkClient(
        SecretsManager,
        opts,
        configuration.awsConnectionParameters,
        logger
    )) as SecretsManager
}

export async function createDefaultLambda(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<Lambda> {
    const lambdaOpts: Lambda.ClientConfiguration = {
        apiVersion: '2015-03-31'
    }

    // tslint:disable-next-line: no-unsafe-any
    return (await SdkUtils.createAndConfigureSdkClient(
        Lambda,
        lambdaOpts,
        configuration.awsConnectionParameters,
        logger
    )) as Lambda
}

export async function createDefaultSNS(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<SNS> {
    const snsOpts: SNS.ClientConfiguration = {
        apiVersion: '2010-03-31'
    }

    // tslint:disable-next-line: no-unsafe-any
    return (await SdkUtils.createAndConfigureSdkClient(
        SNS,
        snsOpts,
        configuration.awsConnectionParameters,
        logger
    )) as SNS
}

export async function createDefaultSQS(
    configuration: GenericClientConfiguration,
    logger: (msg: string) => void
): Promise<SQS> {
    const sqsOpts: SQS.ClientConfiguration = {
        apiVersion: '2012-11-05'
    }

    // tslint:disable-next-line: no-unsafe-any
    return (await SdkUtils.createAndConfigureSdkClient(
        SQS,
        sqsOpts,
        configuration.awsConnectionParameters,
        logger
    )) as SQS
}
