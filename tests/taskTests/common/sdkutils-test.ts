/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SdkUtils } from 'Common/sdkutils'

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
