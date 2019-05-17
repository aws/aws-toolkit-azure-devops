/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { setWaiterParams } from 'Common/cloudformationutils'

describe('CloudFormationUtils', () => {
    test('Set waiter params conforms to standard', () => {
        const params = setWaiterParams('stack', 2, 'changeset')
        expect((params as any).StackName).toBe('stack')
        expect((params as any).ChangeSetName).toBe('changeset')
        expect(((params as any).$waiter as any).maxAttempts).toBe(4)
    })
})
