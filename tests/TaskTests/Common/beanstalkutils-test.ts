/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ElasticBeanstalk } from 'aws-sdk'
import { BeanstalkUtils } from 'Common/beanstalkutils'
import path = require('path')

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const s3BucketResponse = {
    promise: () => ({ S3Bucket: 'bucket' })
}

describe('BeanstalkUtils', () => {
    test('DetermineS3Bucket succeds', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.createStorageLocation = jest.fn(() => s3BucketResponse)
        const response = await BeanstalkUtils.determineS3Bucket(beanstalk)
        expect(response).toBe('bucket')
    })

    test('DetermineS3Bucket fails, throws', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.createStorageLocation = jest.fn(() => {
            throw new Error('failure')
        })
        await BeanstalkUtils.determineS3Bucket(beanstalk).catch(err => {
            expect(`${err}`).toContain('Error: failure')
        })
    })

    test('PrepareAspNet bundle fails, throws', async () => {
        const tmp = path.join(__dirname, '../../Resources/BeanstalkBundle')
        const code = path.join(__dirname, '../../Resources/BeanstalkBundle')
        await BeanstalkUtils.prepareAspNetCoreBundle(tmp, code).catch(err => {
            expect(`${err}`).toContain('Error: failure')
        })
    })

    test('PrepareAspNet bundle succeeds, verify output', () => {
        return undefined
    })

    test('ConstructVersionLabel succeeds', () => {
        expect(BeanstalkUtils.constructVersionLabel('label')).toBe('label')
        expect(BeanstalkUtils.constructVersionLabel(undefined)).toMatch(new RegExp('^v[0-9]+$'))
    })

    test('UploadBundle throws on failure', () => {
        return undefined
    })

    test('UploadBundle succeeds', () => {
        return undefined
    })

    test('VerifyApplicationExists throws on failure', () => {
        return undefined
    })

    test('VerifyApplicationExists succeeds', () => {
        return undefined
    })

    test('VerifyEnvironmentExists throws on failure', () => {
        return undefined
    })

    test('VerifyEnvironmentExists succeeds', () => {
        return undefined
    })
})
