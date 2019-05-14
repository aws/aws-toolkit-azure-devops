/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SSM } from 'aws-sdk'

import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SystemsManagerGetParameter/TaskOperations'
import { TaskParameters } from '../../../Tasks/SystemsManagerGetParameter/TaskParameters'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

describe('Systems Manager Get Parameter', () => {
    const defaultTaskParameters: TaskParameters = {
        awsConnectionParameters: undefined,
        readMode: undefined,
        parameterName: undefined,
        parameterVersion: undefined,
        parameterPath: undefined,
        recursive: undefined,
        variableNameTransform: undefined,
        customVariableName: undefined,
        replacementPattern: undefined,
        replacementText: undefined,
        globalMatch: undefined,
        caseInsensitiveMatch: undefined
    }
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SecretsManagerGetSecret/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SSM(), defaultTaskParameters)).not.toBeNull()
    })

    test('Read mode unknown throws', () => {

    })

    test('Read mode single reads', () => {

    })

    test('Read mode hierarchy reads depth of one', () => {

    })

    test('Read mode hierarchy reads recursively', () => {

    })
})
