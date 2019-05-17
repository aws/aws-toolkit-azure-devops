/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import {  } from 'Common/cloudformationutils'

describe('CloudFormationUtils', () => {
    test('Get Tags Returns Undefined On Empty Or Null', () => {
        // tslint:disable-next-line: no-null-keyword
        expect(SdkUtils.getTags<KeyValue[]>(null)).toBeUndefined()
        expect(SdkUtils.getTags<KeyValue[]>([])).toBeUndefined()
        expect(SdkUtils.getTags<KeyValue[]>(undefined)).toBeUndefined()
    })

})
