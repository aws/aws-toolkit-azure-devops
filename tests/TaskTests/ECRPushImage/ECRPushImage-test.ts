/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ECR } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/ECRPushImage/TaskOperations'
import { TaskParameters } from '../../../Tasks/ECRPushImage/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    imageSource: undefined,
    sourceImageName: undefined,
    sourceImageTag: undefined,
    sourceImageId: undefined,
    repositoryName: undefined,
    pushTag: undefined,
    autoCreateRepository: undefined,
    outputVariable: undefined
}

describe('Secrets Manger Get Secret', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/ECRPushImage/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new ECR(), defaultTaskParameters)).not.toBeNull()
    })

    test('Creates a TaskOperation', () => {
        const taskOperaitons = new TaskOperations(new ECR(), defaultTaskParameters)
        taskOperaitons.locateDockerExecutable = async () => ''
    })
})
