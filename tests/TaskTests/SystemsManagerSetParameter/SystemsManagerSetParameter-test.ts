/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SSM } from 'aws-sdk'
import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SystemsManagerSetParameter/TaskOperations'
import { TaskParameters } from '../../../Tasks/SystemsManagerSetParameter/TaskParameters'

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    parameterName: undefined,
    parameterType: undefined,
    parameterValue: undefined,
    encryptionKeyId: undefined
}

describe('Secrets Manger Get Secret', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../../_build/Tasks/SystemsManagerSetParameter/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SSM(), defaultTaskParameters)).not.toBeNull()
    })

    test(('it works or something'), () => {
        return undefined
    })
})
