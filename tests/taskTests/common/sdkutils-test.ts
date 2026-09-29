/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSConnectionParameters, getCredentials, getRegion } from 'lib/awsConnectionParameters'
import { SdkUtils } from 'lib/sdkutils'

jest.mock('azure-pipelines-task-lib/task')
// Only the two resolvers are stubbed; validateRegion stays REAL, so these tests
// exercise the same check the OIDC path uses rather than a stand-in for it.
jest.mock('lib/awsConnectionParameters', () => ({
    ...jest.requireActual('lib/awsConnectionParameters'),
    getRegion: jest.fn(),
    getCredentials: jest.fn()
}))

const getRegionMock = getRegion as jest.Mock
const getCredentialsMock = getCredentials as jest.Mock

interface KeyValue {
    Key?: string
    Value?: string
}

describe('SdkUtils', () => {
    test('Get Tags Returns Undefined On Empty', () => {
        expect(SdkUtils.getTags<KeyValue[]>([])).toBeUndefined()
    })

    test('Get Tags Parses Properly', () => {
        const arr: string[] = ['what=2', 'yes=3']
        const parsed = SdkUtils.getTags<KeyValue[]>(arr)
        if (!parsed) {
            throw new Error('parsed null!')
        }
        expect(parsed[0].Key).toBe('what')
        expect(parsed[1].Value).toBe('3')
    })

    test('Get Tags Parses Properly with multiple =', () => {
        const arr: string[] = ['what=2=2']
        const parsed = SdkUtils.getTags<KeyValue[]>(arr)
        if (!parsed) {
            throw new Error('parsed null!')
        }
        expect(parsed[0].Key).toBe('what')
        expect(parsed[0].Value).toBe('2=2')
    })

    test("Get Tags doesn't parse wrong things", () => {
        const arr: string[] = ['=what=2=2']
        const parsed = SdkUtils.getTags<KeyValue[]>(arr)
        if (!parsed) {
            throw new Error('parsed null!')
        }
        expect(parsed.length).toBe(0)
    })

    test('Get Tags Dictonary returns properly', () => {
        const arr: string[] = ['what=2=2', 'yes=1']
        const parsed: any = SdkUtils.getTagsDictonary(arr)
        expect(parsed).toStrictEqual({ what: '2=2', yes: '1' })
    })

    test('Get Tags Dictonary returns undefined when empty input', () => {
        const arr: string[] = []
        const parsed: any = SdkUtils.getTagsDictonary(arr)
        expect(parsed).toBeUndefined()
    })
})

describe('SdkUtils.createAndConfigureSdkClient — region validation', () => {
    // The SDK builds every endpoint host by interpolating the region, so a value
    // carrying a URL delimiter moves the host to another authority and the client
    // signs a real request to it. The OIDC exchange already refused such a value
    // before minting a token; every other task built its clients through here, where
    // the value was unvalidated.
    const connectionParameters = {
        logRequestData: false,
        logResponseData: false
    } as AWSConnectionParameters

    /** A stand-in for an aws-sdk client class, so nothing hits the network. */
    function fakeServiceClass(): any {
        const built: any[] = []
        const cls: any = function(this: any, opts: any) {
            built.push(opts)
        }
        cls.prototype.customizeRequests = (): void => undefined
        cls.built = built

        return cls
    }

    const create = (serviceOpts: any, cls: any = fakeServiceClass()): Promise<any> =>
        SdkUtils.createAndConfigureSdkClient(cls, serviceOpts, connectionParameters, () => undefined)

    beforeEach(() => {
        // The resolved region is stubbed rather than driven through getRegion's own
        // sources: on an EC2 build host it answers from instance metadata, so a test
        // that set no region would silently exercise a real one.
        getRegionMock.mockReset()
        getCredentialsMock.mockReset()
        getCredentialsMock.mockResolvedValue(undefined)
    })

    it.each([
        ['a host delimiter', '@evil.com/'],
        ['an embedded path', 'us-west-2/../evil'],
        ['a scheme', 'https://evil.com'],
        ['a port', 'us-west-2:443'],
        ['a query', 'us-west-2?x=1'],
        ['a fragment', 'us-west-2#x'],
        ['whitespace', 'us-west-2 '],
        ['uppercase, which nothing on this path canonicalizes', 'US-WEST-2']
    ])('refuses a resolved region carrying %s, without building a client', async (_label, region) => {
        getRegionMock.mockResolvedValue(region)
        const cls = fakeServiceClass()
        await expect(create(undefined, cls)).rejects.toThrow(/Invalid AWS region/)
        // Fail CLOSED: refused before the constructor runs, so no signed request can
        // reach the substituted host.
        expect(cls.built).toHaveLength(0)
    })

    it('never echoes the rejected value, which is rendered in the Azure DevOps UI', async () => {
        getRegionMock.mockResolvedValue('@evil.com/')
        const err = await create(undefined).catch((e: Error) => e)
        expect(String(err)).not.toContain('evil.com')
        expect(String(err)).toContain('Refusing to build an AWS service client from an unvalidated region.')
    })

    it.each([
        ['a commercial region', 'us-west-2'],
        ['GovCloud', 'us-gov-west-1'],
        ['China', 'cn-north-1'],
        ['ISO', 'us-iso-east-1'],
        ['ISO-B', 'us-isob-east-1'],
        ['a two-digit ordinal', 'ap-southeast-10']
    ])('accepts %s', async (_label, region) => {
        getRegionMock.mockResolvedValue(region)
        const cls = fakeServiceClass()
        await expect(create(undefined, cls)).resolves.toBeDefined()
        expect(cls.built[0].region).toBe(region)
    })

    it.each([
        ['an empty string, when no source supplies a region', ''],
        ['undefined, when instance-metadata resolution yields nothing', undefined]
    ])('passes %s through, so SDK-side resolution still works', async (_label, region) => {
        // getRegion() can answer either shape for "nothing configured". Rejecting
        // them would break every task that relies on the SDK's own resolution chain,
        // which is why the guard is one falsy check rather than a test against ''.
        getRegionMock.mockResolvedValue(region)
        const cls = fakeServiceClass()
        await expect(create(undefined, cls)).resolves.toBeDefined()
        expect(cls.built).toHaveLength(1)
    })

    it('validates a region supplied in the service options, not only the resolved one', async () => {
        // The value that reaches the constructor is what matters, whichever source it
        // came from — a caller-supplied option skips getRegion() entirely.
        getRegionMock.mockResolvedValue('us-west-2')
        const cls = fakeServiceClass()
        await expect(create({ region: '@evil.com/' }, cls)).rejects.toThrow(/Invalid AWS region/)
        expect(cls.built).toHaveLength(0)
        expect(getRegionMock).not.toHaveBeenCalled()
    })

    it('accepts a valid region supplied in the service options', async () => {
        await expect(create({ region: 'eu-central-1' })).resolves.toBeDefined()
    })
})
