/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { ElasticBeanstalk, S3 } from 'aws-sdk'
import { BeanstalkUtils } from 'lib/beanstalkUtils'
import { SdkUtils } from 'lib/sdkutils'
import path = require('path')
import AdmZip = require('adm-zip')
import { makeTemporaryFolder } from '../testCommon'

jest.mock('aws-sdk')

const s3BucketResponse = {
    promise: () => ({ S3Bucket: 'bucket' })
}

const s3BucketResponseUndefined = {
    promise: () => ({ S3Bucket: undefined })
}

const verifyApplicationExistsResponse = {
    promise: () => ({ Applications: ['yes'] })
}

const verifyApplicationExistsDoesNot = {
    promise: () => ({ Applications: [] })
}

const verifyEnvironmentsExistsResponse = {
    promise: () => ({ Environments: ['yes'] })
}

const verifyEnvironmentsExistsDoesNot = {
    promise: () => ({ Environments: [] })
}

describe('BeanstalkUtils', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/BeanstalkDeployApplication/task.json')
    })

    test('DetermineS3Bucket succeeds', async () => {
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

    test('DetermineS3Bucket returns undefined returns empty', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.createStorageLocation = jest.fn(() => s3BucketResponseUndefined)
        const response = await BeanstalkUtils.determineS3Bucket(beanstalk)
        expect(response).toBe('')
    })

    test('Prepare AspNetcore bundle Windows succeeds', async () => {
        const temp = await makeTemporaryFolder('beanstalkBundle')
        const code = path.join(__dirname, '../../resources/beanstalkBundle')
        const p = await BeanstalkUtils.prepareAspNetCoreBundleWindows(code, temp)
        const beanstalkBundle = new AdmZip(p)
        const entries = beanstalkBundle.getEntries()
        expect(entries.length).toBe(4)
        expect(entries[0].entryName).toBe('aws-windows-deployment-manifest.json')
        expect(entries[1].entryName).toBe('app/doc.txt')
    })

    // This is so we don't regress functionality, but the behavior difference is weird
    test('Prepare AspNetcore bundle single entry Windows succeeds', async () => {
        const temp = await makeTemporaryFolder('beanstalkBundle')
        const code = path.join(__dirname, '../../resources/beanstalkBundle/doc.txt')
        const p = await BeanstalkUtils.prepareAspNetCoreBundleWindows(code, temp)
        const beanstalkBundle = new AdmZip(p)
        const entries = beanstalkBundle.getEntries().map(it => it.entryName)
        expect(entries.length).toBe(2)
        expect(entries).toContain('aws-windows-deployment-manifest.json')
        expect(entries).toContain('doc.txt')
    })

    test('Prepare AspNetcore bundle Linux single file returns the code path', async () => {
        const temp = await makeTemporaryFolder('beanstalkBundle')
        const code = path.join(__dirname, '../../resources/beanstalkBundle/doc.txt')
        const p = await BeanstalkUtils.prepareAspNetCoreBundleLinux(code, temp)
        expect(p).toContain(`beanstalkBundle${path.sep}doc.txt`)
    })

    test('Prepare AspNetcore bundle Linux succeeds', async () => {
        const temp = await makeTemporaryFolder('beanstalkBundle')
        const code = path.join(__dirname, '../../resources/beanstalkBundle')
        const p = await BeanstalkUtils.prepareAspNetCoreBundleLinux(code, temp)
        const beanstalkBundle = new AdmZip(p)
        const entries = beanstalkBundle.getEntries().map(it => it.entryName)
        expect(entries.length).toBe(3)
        expect(entries).toContain('doc.txt')
    })

    test('ConstructVersionLabel succeeds', async () => {
        expect(BeanstalkUtils.constructVersionLabel('label')).toBe('label')
        expect(BeanstalkUtils.constructVersionLabel('')).toMatch(new RegExp('^v[0-9]+$'))
    })

    test('UploadBundle throws on failure', async () => {
        expect.assertions(1)
        const s3 = new S3() as any
        s3.upload = jest.fn(() => {
            throw Error('it failed')
        })
        await BeanstalkUtils.uploadBundle(s3, 'path', 'name', 'object').catch(err => {
            expect(`${err}`).toContain('it failed')
        })
    })

    test('UploadBundle succeeds', async () => {
        expect.assertions(3)
        const s3 = new S3() as any
        s3.upload = jest.fn(args => {
            expect(args.Bucket).toEqual('name')
            expect(args.Key).toEqual('object')
            expect(args.Body.path).toEqual(path.join(__dirname, __filename))

            return s3BucketResponse
        })
        await BeanstalkUtils.uploadBundle(s3, path.join(__dirname, __filename), 'name', 'object')
    })

    test('VerifyApplicationExists throws on failure', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsDoesNot)
        await BeanstalkUtils.verifyApplicationExists(beanstalk, 'nonexistantapplication').catch(err => {
            expect(`${err}`).toContain('Application nonexistantapplication does not exist')
        })
    })

    test('VerifyApplicationExists fails on sdk throw', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => {
            throw new Error('OW!')
        })
        await BeanstalkUtils.verifyApplicationExists(beanstalk, 'nonexistantapplication').catch(err => {
            expect(`${err}`).toContain('Application nonexistantapplication does not exist')
        })
    })

    test('VerifyApplicationExists succeeds', async () => {
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyApplicationExistsResponse)
        await BeanstalkUtils.verifyApplicationExists(beanstalk, 'existantapplication')
    })

    test('VerifyEnvironmentExists throws on failure', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => verifyEnvironmentsExistsDoesNot)
        await BeanstalkUtils.verifyEnvironmentExists(beanstalk, 'nonexistantapplication', 'yes').catch(err => {
            expect(`${err}`).toContain('Environment yes does not exist for the application nonexistantapplication')
        })
    })

    test('VerifyEnvironmentExists fails on sdk throw', async () => {
        expect.assertions(1)
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeApplications = jest.fn(() => {
            throw new Error('OW!')
        })
        await BeanstalkUtils.verifyEnvironmentExists(beanstalk, 'nonexistantapplication', 'yes').catch(err => {
            expect(`${err}`).toContain('Environment yes does not exist for the application nonexistantapplication')
        })
    })

    test('VerifyEnvironmentExists succeeds', async () => {
        const beanstalk = new ElasticBeanstalk() as any
        beanstalk.describeEnvironments = jest.fn(() => verifyEnvironmentsExistsResponse)
        await BeanstalkUtils.verifyEnvironmentExists(beanstalk, 'existantapplication', 'yes')
    })
})
