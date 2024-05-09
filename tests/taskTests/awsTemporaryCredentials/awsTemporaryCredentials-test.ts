/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/AWSTemporaryCredentials/TaskOperations'
import { TaskParameters } from 'tasks/AWSTemporaryCredentials/TaskParameters'
import sts = require('@aws-sdk/client-sts')
import tl = require('azure-pipelines-task-lib/task')

const originalEnv = process.env

const defaultTaskParameters: TaskParameters = {
    connectedServiceNameARM: 'default',
    regionName: 'regionName',
    assumeRole: 'assumeRole',
    varPrefix: 'PREFIX_',
    failOnStandardError: false
}

describe('Get OIDC Credentials', () => {
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/AWSTemporaryCredentials/task.json')
    })

    afterEach(() => {
        jest.restoreAllMocks()
        process.env = originalEnv
    })
    beforeEach(() => {
        jest.resetAllMocks()
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(defaultTaskParameters)).not.toBeNull()
    })

    test('Fails on missing accessToken', async () => {
        const taskOperations = new TaskOperations(defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Error: System.AccessToken is undefined'))
    })

    test('Fail on undefined oidcToken', async () => {
        const taskOperations = new TaskOperations(defaultTaskParameters)
        const getOIDCTokenSpy = jest.spyOn(TaskOperations.prototype as any, 'getOIDCToken').mockImplementation(() => {
            return undefined
        })

        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Failed to get a Token from the connection'))

        expect(getOIDCTokenSpy).toHaveBeenCalledWith(defaultTaskParameters.connectedServiceNameARM)
    })

    test('Get OIDC Token', async () => {
        process.env = {
            ...originalEnv,
            ['BUILD_BUILDID']: 'B',
            ['SYSTEM_DEFINITIONID']: 'DI',
            ['SYSTEM_TEAMPROJECT']: 'TP'
        }

        const ACCESS_KEY_ID = 'DUMMY_ACCESSKEYID'
        const SECRET_ACCESS_KEY = 'DUMMY_SECRETACCESSKEY'
        const SESSION_TOKEN = 'DUMMY_SESSIONTOKEN'

        const tlSetVariableSpy = jest.spyOn(tl, 'setVariable')
        const taskOperations = new TaskOperations(defaultTaskParameters)

        const getOIDCTokenSpy = jest.spyOn(TaskOperations.prototype as any, 'getOIDCToken').mockImplementation(() => {
            return 'DUMMY_TOKEN'
        })

        const clientSendSpy = jest.spyOn(sts.STSClient.prototype as any, 'send').mockImplementation(() => {
            return {
                Credentials: {
                    AccessKeyId: ACCESS_KEY_ID,
                    SecretAccessKey: SECRET_ACCESS_KEY,
                    SessionToken: SESSION_TOKEN
                }
            }
        })

        await taskOperations.execute()

        expect(getOIDCTokenSpy).toHaveBeenCalledWith(defaultTaskParameters.connectedServiceNameARM)
        expect(clientSendSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    RoleArn: defaultTaskParameters.assumeRole,
                    RoleSessionName: 'TP-DI-B',
                    WebIdentityToken: 'DUMMY_TOKEN'
                })
            })
        )

        const expectedAccessKey = 'PREFIX_ACCESS_KEY_ID'
        const expectedSecretAccessKey = 'PREFIX_SECRET_ACCESS_KEY'
        const expectedSessionToken = 'PREFIX_SESSION_TOKEN'
        expect(tlSetVariableSpy).toBeCalledTimes(3)
        expect(tlSetVariableSpy).toBeCalledWith(expectedAccessKey, ACCESS_KEY_ID)
        expect(tlSetVariableSpy).toBeCalledWith(expectedSecretAccessKey, SECRET_ACCESS_KEY, true) // This one needs to be a secret
        expect(tlSetVariableSpy).toBeCalledWith(expectedSessionToken, SESSION_TOKEN)
    })

    test('Long Session name is trimmed to <64 chars', async () => {
        process.env = {
            ...originalEnv,
            ['BUILD_BUILDID']: 'B123456789012345678901234567890',
            ['SYSTEM_DEFINITIONID']: 'DI123456789012345678901234567890',
            ['SYSTEM_TEAMPROJECT']: 'TP123456789012345678901234567890'
        }
        const taskOperations = new TaskOperations(defaultTaskParameters)

        const getOIDCTokenSpy = jest.spyOn(TaskOperations.prototype as any, 'getOIDCToken').mockImplementation(() => {
            return 'DUMMY_TOKEN'
        })

        const clientMock = jest.spyOn(sts.STSClient.prototype as any, 'send').mockImplementation(() => {
            return {
                Credentials: {
                    AccessKeyId: 'DUMMY_ACCESSKEYID',
                    SecretAccessKey: 'DUMMY_SECRETACCESSKEY',
                    SessionToken: 'DUMMY_SESSIONTOKEN'
                }
            }
        })

        await taskOperations.execute()

        expect(getOIDCTokenSpy).toHaveBeenCalledWith(defaultTaskParameters.connectedServiceNameARM)
        expect(clientMock).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    RoleArn: defaultTaskParameters.assumeRole,
                    RoleSessionName: 'TP1234...567890-DI1234...567890-B12345...567890',
                    WebIdentityToken: 'DUMMY_TOKEN'
                })
            })
        )
    })

    test('We have a 12-15 characters ID', async () => {
        process.env = {
            ...originalEnv,
            ['BUILD_BUILDID']: 'B123456789012',
            ['SYSTEM_DEFINITIONID']: 'DI123456789012345678901234567890',
            ['SYSTEM_TEAMPROJECT']: 'TP123456789012345678901234567890'
        }
        const taskOperations = new TaskOperations(defaultTaskParameters)

        const getOIDCTokenSpy = jest.spyOn(TaskOperations.prototype as any, 'getOIDCToken').mockImplementation(() => {
            return 'DUMMY_TOKEN'
        })

        const clientMock = jest.spyOn(sts.STSClient.prototype as any, 'send').mockImplementation(() => {
            return {
                Credentials: {
                    AccessKeyId: 'DUMMY_ACCESSKEYID',
                    SecretAccessKey: 'DUMMY_SECRETACCESSKEY',
                    SessionToken: 'DUMMY_SESSIONTOKEN'
                }
            }
        })

        await taskOperations.execute()

        expect(getOIDCTokenSpy).toHaveBeenCalledWith(defaultTaskParameters.connectedServiceNameARM)
        expect(clientMock).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    RoleArn: defaultTaskParameters.assumeRole,
                    RoleSessionName: 'TP1234...567890-DI1234...567890-B123456789012',
                    WebIdentityToken: 'DUMMY_TOKEN'
                })
            })
        )
    })
})
