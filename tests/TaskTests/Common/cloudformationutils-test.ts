/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CloudFormation } from 'aws-sdk'
import {
    captureStackOutputs,
    setWaiterParams,
    testChangeSetExists,
    testStackExists,
    testStackHasResources,
    waitForStackCreation,
    waitForStackUpdate
} from 'Common/cloudformationutils'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const cloudFormationDescribeStacksSucceeds = {
    promise: function() {
        return {
            Stacks: [{ StackId: 'yes', Outputs: {} }]
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

const cloudFormationPromiseThrows = {
    promise: function() {
        throw new Error('error')
    }
}

describe('CloudFormationUtils', () => {
    test('Capture stack output reads from the right response', async () => {
        const cloudFormation = new CloudFormation() as any
        cloudFormation.describeStacks = jest.fn(() => cloudFormationDescribeStacksSucceeds)
        await captureStackOutputs(cloudFormation, 'stack', false, false)
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

    test('Wait for stack update', async () => {
        expect.assertions(1)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.waitFor = jest.fn(() => cloudFormationPromiseThrows)
        await waitForStackUpdate(cloudFormation, 'stack').catch(item => {
            expect(item).toEqual(new Error('StackUpdateFailed stack error'))
        })
        cloudFormation.waitFor = jest.fn(() => cloudFormationDescribeStacksSucceeds)
        await waitForStackUpdate(cloudFormation, 'stack')
    })

    test('Test wait for stack creation', async () => {
        expect.assertions(1)
        const cloudFormation = new CloudFormation() as any
        cloudFormation.waitFor = jest.fn(() => cloudFormationPromiseThrows)
        await waitForStackCreation(cloudFormation, 'stack').catch(item => {
            expect(item).toEqual(new Error('StackCreationFailed stack error'))
        })
        cloudFormation.waitFor = jest.fn(() => cloudFormationDescribeStacksSucceeds)
        await waitForStackCreation(cloudFormation, 'stack')
    })

    test('Set waiter params conforms to standard', () => {
        const params = setWaiterParams('stack', 2, 'changeset')
        expect(params.StackName).toBe('stack')
        expect(params.ChangeSetName).toBe('changeset')
        expect(params.$waiter.maxAttempts).toBe(4)
    })

    test('Test stack exists', async () => {
        expect.assertions(2)
        const cloudFormation = new CloudFormation() as any
        expect(await testStackExists(cloudFormation, 'stack')).toBeUndefined()
        cloudFormation.describeStacks = jest.fn(() => cloudFormationDescribeStacksSucceeds)
        expect(await testStackExists(cloudFormation, 'stack')).toBe('yes')
    })

    test('Test change set exists', async () => {
        expect.assertions(2)
        const cloudFormation = new CloudFormation() as any
        expect(await testChangeSetExists(cloudFormation, 'changeset', 'stack')).toBe(false)
        cloudFormation.describeChangeSet = jest.fn(() => cloudFormationDescribeStacksSucceeds)
        expect(await testChangeSetExists(cloudFormation, 'changeset', 'stack')).toBe(true)
    })
})
