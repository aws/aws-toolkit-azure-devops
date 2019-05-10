/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { TaskOperations } from '../../../Tasks/SecretsManagerGetSecret/GetSecretTaskOperations'
import { TaskParameters } from '../../../Tasks/SecretsManagerGetSecret/GetSecretTaskParameters'

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: undefined,
    secretIdOrName: undefined,
    variableName: undefined,
    versionId: undefined,
    versionStage: undefined
}

describe('Secrets Manger Get Secret', () => {
    test('Fails on exception thrown', () => {
        return undefined
    })

    test('Handles secret string', () => {
        return undefined
    })

    test('Handles and decodes secret binary', () => {
        return undefined
    })

    test('reads version stage', () => {
        return undefined
    })

    test('Prioritizes version id', () => {
        return undefined
    })
})
