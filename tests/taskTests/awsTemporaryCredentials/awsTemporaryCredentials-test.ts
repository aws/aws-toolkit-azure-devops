/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SdkUtils } from 'lib/sdkutils'
import { TaskOperations } from 'tasks/AWSTemporaryCredentials/TaskOperations'
import { TaskParameters } from 'tasks/AWSTemporaryCredentials/TaskParameters'

jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    connectedServiceNameARM: 'default',
    regionName: 'regionName',
    assumeRole: 'assumeRole',
    varPrefix: 'PREFIX',
    failOnStandardError: false
}

describe('Get OIDC Credentials', () => {
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../build/src/tasks/AWSTemporaryCredentials/task.json')
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(defaultTaskParameters)).not.toBeNull()
    })

    test('Fails on missing accessToken', async () => {
        expect.assertions(1)
        const taskOperations = new TaskOperations(defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`).toContain('Error: System.AccessToken is undefined'))
    })

    xtest('Fails on failed auth', async () => {
        const getOIDCTokenSpy = jest.spyOn(TaskOperations.prototype as any, 'getOIDCToken').mockImplementation(() => {
            return 'DUMMY_TOKEN'
        })
        // Our mock doesn't work right now
        expect(getOIDCTokenSpy).toHaveBeenCalledWith(defaultTaskParameters.connectedServiceNameARM)

        expect.assertions(1)
        const taskOperations = new TaskOperations(defaultTaskParameters)
        await taskOperations.execute().catch(e => expect(`${e}`))
    })
})
