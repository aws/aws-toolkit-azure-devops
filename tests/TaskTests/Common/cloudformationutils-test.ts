/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation } from 'aws-sdk'
import { setWaiterParams, testStackExists, testStackHasResources } from 'Common/cloudformationutils'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const cloudFormationDescribeStacksSucceeds = {
    promise: function() {
        return {
            Stacks: [{ StackId: 'yes' }]
        }
    }
}

const cloudFormationHasResourcesSucceeds = {
    promise: function() {
        return {
            StackResources: [{ StackId: 'yes' }]
        }
    }
}

describe('CloudFormationUtils', () => {
    test('Set waiter params conforms to standard', () => {
        const params = setWaiterParams('stack', 2, 'changeset')
        expect(params.StackName).toBe('stack')
        expect(params.ChangeSetName).toBe('changeset')
        expect(params.$waiter.maxAttempts).toBe(4)
    })

    test('Test stack has resources', async () => {
        expect.assertions(3)
        const cloudFormation = new CloudFormation() as any
        expect(await testStackHasResources(cloudFormation, 'stack')).toBe(false)
        cloudFormation.describeStackResources = jest.fn(() => cloudFormationDescribeStacksSucceeds)
        expect(await testStackHasResources(cloudFormation, 'stack')).toBeUndefined()
        cloudFormation.describeStackResources = jest.fn(() => cloudFormationHasResourcesSucceeds)
        expect(await testStackHasResources(cloudFormation, 'stack')).toBe(true)
    })

    test('Test stack exists', async () => {
        expect.assertions(2)
        const cloudFormation = new CloudFormation() as any
        expect(await testStackExists(cloudFormation, 'stack')).toBeUndefined()
        cloudFormation.describeStacks = jest.fn(() => cloudFormationDescribeStacksSucceeds)
        expect(await testStackExists(cloudFormation, 'stack')).toBe('yes')
    })
})
