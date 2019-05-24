/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SdkUtils } from 'Common/sdkutils'

interface KeyValue {
    Key?: string
    Value?: string
}

describe('SdkUtils', () => {
    test('Get Tags Returns Undefined On Empty Or Null', () => {
        // tslint:disable-next-line: no-null-keyword
        expect(SdkUtils.getTags<KeyValue[]>(null)).toBeUndefined()
        expect(SdkUtils.getTags<KeyValue[]>([])).toBeUndefined()
        expect(SdkUtils.getTags<KeyValue[]>(undefined)).toBeUndefined()
    })

    test('Get Tags Parses Properly', () => {
        const arr: string[] = ['what=2', 'yes=3']
        const parsed: KeyValue[] = SdkUtils.getTags<KeyValue[]>(arr)
        expect(parsed[0].Key).toBe('what')
        expect(parsed[1].Value).toBe('3')
    })

    test('Get Tags Parses Properly with multiple =', () => {
        const arr: string[] = ['what=2=2']
        const parsed: KeyValue[] = SdkUtils.getTags<KeyValue[]>(arr)
        expect(parsed[0].Key).toBe('what')
        expect(parsed[0].Value).toBe('2=2')
    })

    test("Get Tags doesn't parse wrong things", () => {
        const arr: string[] = ['=what=2=2']
        const parsed: KeyValue[] = SdkUtils.getTags<KeyValue[]>(arr)
        expect(parsed.length).toBe(0)
    })

    test('Get Tags Dictonary returns properly', () => {
        const arr: string[] = ['what=2=2', 'yes=1']
        const parsed: any = SdkUtils.getTagsDictonary<{}>(arr)
        // tslint:disable-next-line: no-unsafe-any
        expect(parsed).toStrictEqual({ what: '2=2', yes: '1' })
    })
})
