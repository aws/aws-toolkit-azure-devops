/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { IAM, Lambda } from 'aws-sdk'
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils'
import { TaskOperations } from '../../../Tasks/LambdaDeployFunction/TaskOperations'
import { TaskParameters } from '../../../Tasks/LambdaDeployFunction/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const baseTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    deploymentMode: undefined,
    functionName: undefined,
    functionHandler: undefined,
    runtime: undefined,
    codeLocation: undefined,
    localZipFile: undefined,
    s3Bucket: undefined,
    s3ObjectKey: undefined,
    s3ObjectVersion: undefined,
    roleARN: undefined,
    description: undefined,
    memorySize: 128,
    timeout: 3,
    publish: undefined,
    deadLetterARN: undefined,
    kmsKeyARN: undefined,
    environment: undefined,
    tags: undefined,
    securityGroups: undefined,
    subnets: undefined,
    tracingConfig: undefined,
    outputVariable: undefined
}

describe('Lambda Deploy Function', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/S3Download/task.json')
    })

    test('Creates a TaskOperation', () => {
        const taskParameters = baseTaskParameters
        expect(new TaskOperations(new IAM(), new Lambda(), taskParameters)).not.toBeNull()
    })

    test('Unknown deployment mode fails', () => {
        return undefined
    })

    test('Fails to update fails', () => {
        return undefined
    })

    test('Fails to deploy fails', () => {
        return undefined
    })

    test('Deploy only Function does not exist fails', () => {
        return undefined
    })

    test('Deploy only Function exists calls update', () => {
        return undefined
    })

    test('Deploy and config does not exist calls create', () => {
        return undefined
    })

    test('Deploy and config exists calls upate', () => {
        return undefined
    })

    test('Create function adds fields if they exist', () => {
        return undefined
    })

    test('Update function adds fields if they exist', () => {
        return undefined
    })
})
