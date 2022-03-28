/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { CodeDeploy, S3 } from 'aws-sdk'
import { SdkUtils } from 'lib/sdkutils'
import fs = require('fs')
import path = require('path')
import { TaskOperations } from 'tasks/CodeDeployDeployApplication/TaskOperations'
import {
    revisionSourceFromS3,
    revisionSourceFromWorkspace,
    TaskParameters
} from 'tasks/CodeDeployDeployApplication/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'
import AdmZip = require('adm-zip')

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    applicationName: 'undefined',
    deploymentGroupName: 'undefined',
    deploymentRevisionSource: '',
    revisionBundle: '',
    bucketName: '',
    bundlePrefix: '',
    bundleKey: 'undefined',
    description: '',
    filesAcl: '',
    fileExistsBehavior: '',
    updateOutdatedInstancesOnly: false,
    ignoreApplicationStopFailures: false,
    outputVariable: '',
    timeoutInMins: 0
}

const emptyPromise = {
    promise: () => ({})
}

const codeDeployDeploymentId = {
    promise: () => ({ deploymentId: 'id' })
}

describe('CodeDeploy Deploy Application', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/CodeDeployDeployApplication/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new CodeDeploy(), new S3(), defaultTaskParameters)).not.toBeNull()
    })

    test('Verify resources exists fails, fails task', async () => {
        expect.assertions(1)
        const taskOperations = new TaskOperations(new CodeDeploy(), new S3(), defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Application undefined does not exist')
        })
    })

    test('Verify deployment group exists fails, fails task', async () => {
        expect.assertions(1)
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, new S3(), defaultTaskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Deployment group undefined does not exist')
        })
    })

    test('Verify s3 bucket exists fails, fails task', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromS3
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, new S3(), taskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Archive with key undefined does not exist')
        })
    })

    test('Wait for deployment, fails, fails task', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromS3
        taskParameters.bundleKey = '/whatever/wahtever'
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        codeDeploy.createDeployment = jest.fn(() => codeDeployDeploymentId)
        // the first argument of the callback is error so pass in an "error"
        codeDeploy.waitFor = jest.fn((arr1, arr2, cb) => cb(new Error('22'), undefined))
        const s3 = new S3() as any
        s3.headObject = jest.fn(() => emptyPromise)
        const taskOperations = new TaskOperations(codeDeploy, s3, taskParameters)
        await taskOperations.execute().catch(err => {
            expect(`${err}`).toContain('Error: Deployment failed undefined 22')
        })
    })

    describe('S3 upload needed', () => {
        let codeDeploy: any
        let parameters: TaskParameters

        beforeEach(() => {
            process.env.TEMP = __dirname

            parameters = { ...defaultTaskParameters }
            parameters.deploymentRevisionSource = revisionSourceFromWorkspace
            parameters.revisionBundle = path.join(__dirname, '../../resources/codeDeployCode')
            parameters.applicationName = 'test'

            codeDeploy = new CodeDeploy() as any
            codeDeploy.getApplication = jest.fn(() => emptyPromise)
            codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
            codeDeploy.createDeployment = jest.fn(() => codeDeployDeploymentId)
            codeDeploy.waitFor = jest.fn((thing, thing2, cb) => {
                cb()

                return { promise: () => undefined }
            })
        })

        test('Upload needed, packages properly, succeeds', async () => {
            expect.assertions(7)

            const s3 = new S3() as any
            s3.upload = jest.fn(args => {
                expect(args.Bucket).toBe('')
                expect(args.Key).toContain('test.v')
                expect(args.ACL).toBeUndefined()
                const dir = fs.readdirSync(__dirname)
                for (const file of dir) {
                    if (path.extname(file) === '.zip') {
                        const f = path.join(__dirname, file)
                        const zip = new AdmZip(f)
                        const entries = zip.getEntries().map(it => it.entryName)
                        expect(entries.length).toBe(3)
                        expect(entries).toContain('test.txt')
                        expect(entries).toContain('subpath/')
                        expect(entries).toContain('subpath/abc.txt')
                        break
                    }
                }

                return emptyPromise
            })

            const taskOperations = new TaskOperations(codeDeploy, s3, parameters)
            await taskOperations.execute()
        })

        test('Uses ACL provided by task parameters', async () => {
            expect.assertions(1)
            parameters.filesAcl = 'bucket-owner-full-control'

            const s3 = new S3() as any
            s3.upload = jest.fn(args => {
                expect(args.ACL).toBe('bucket-owner-full-control')

                return emptyPromise
            })

            const taskOperations = new TaskOperations(codeDeploy, s3, parameters)
            await taskOperations.execute()
        })

        test('Does not set ACL when using "none"', async () => {
            expect.assertions(1)
            parameters.filesAcl = 'none'

            const s3 = new S3() as any
            s3.upload = jest.fn(args => {
                expect(args.ACL).toBeUndefined()

                return emptyPromise
            })

            const taskOperations = new TaskOperations(codeDeploy, s3, parameters)
            await taskOperations.execute()
        })
    })

    test('Upload not needed, succeeds', async () => {
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.deploymentRevisionSource = revisionSourceFromS3
        taskParameters.applicationName = 'test'
        taskParameters.bundleKey = path.join(__dirname, '../../resources/codeDeployCode.zip')
        const s3 = new S3() as any
        s3.headObject = jest.fn(() => emptyPromise)
        const codeDeploy = new CodeDeploy() as any
        codeDeploy.getApplication = jest.fn(() => emptyPromise)
        codeDeploy.getDeploymentGroup = jest.fn(() => emptyPromise)
        codeDeploy.createDeployment = jest.fn(() => codeDeployDeploymentId)
        codeDeploy.waitFor = jest.fn((thing, thing2, cb) => {
            cb()

            return { promise: () => undefined }
        })
        const taskOperations = new TaskOperations(codeDeploy, s3, taskParameters)
        await taskOperations.execute()
    })
})
