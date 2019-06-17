/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { SSM } from 'aws-sdk'

import { SdkUtils } from 'Common/sdkutils'
import { TaskOperations } from '../../../Tasks/SystemsManagerGetParameter/TaskOperations'
import { TaskParameters } from '../../../Tasks/SystemsManagerGetParameter/TaskParameters'
import { emptyConnectionParameters } from '../testCommon'

// unsafe any's is how jest mocking works, so this needs to be disabled for all test files
// tslint:disable: no-unsafe-any
jest.mock('aws-sdk')

const defaultTaskParameters: TaskParameters = {
    awsConnectionParameters: emptyConnectionParameters,
    readMode: '',
    parameterName: '',
    parameterVersion: undefined,
    parameterPath: '',
    recursive: undefined,
    variableNameTransform: '',
    customVariableName: '',
    replacementPattern: '',
    replacementText: '',
    globalMatch: false,
    caseInsensitiveMatch: false
}

const singleParameterResponse = {
    promise: function() {
        return {
            Parameter: {
                Type: 'type',
                Value: 'value'
            }
        }
    }
}

const hierarchyParameterResponse = {
    promise: function() {
        return {
            Parameters: [
                {
                    Type: 'type',
                    Value: 'value'
                }
            ],
            NextToken: undefined
        }
    }
}

const hierarchyParameterResponseMultiple = {
    promise: function() {
        return {
            Parameters: [
                {
                    Type: 'type',
                    Value: 'value'
                }
            ],
            NextToken: '23'
        }
    }
}

describe('Systems Manager Get Parameter', () => {
    // TODO https://github.com/aws/aws-vsts-tools/issues/167
    beforeAll(() => {
        SdkUtils.readResourcesFromRelativePath('../../_build/Tasks/SystemsManagerGetParameter/task.json')
    })

    test('Creates a TaskOperation', () => {
        expect(new TaskOperations(new SSM(), defaultTaskParameters)).not.toBeNull()
    })

    test('Read mode unknown throws', async () => {
        expect.assertions(1)
        const taskOperations = new TaskOperations(new SSM(), defaultTaskParameters)
        taskOperations.execute().catch(e => expect(e).toContain('is not a valid parameter'))
    })

    test('Read mode single reads', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.readMode = 'single'
        taskParameters.variableNameTransform = 'none'
        taskParameters.parameterName = 'yes'
        const ssm = new SSM() as any
        ssm.getParameter = jest.fn(() => singleParameterResponse)
        const taskOperations = new TaskOperations(ssm, taskParameters)
        await taskOperations.execute()
        expect(ssm.getParameter).toBeCalled()
    })

    test('Read mode hierarchy reads depth of one', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.readMode = 'hierarchy'
        taskParameters.variableNameTransform = 'none'
        taskParameters.parameterName = 'yes'
        taskParameters.parameterPath = '/params'
        const ssm = new SSM() as any
        ssm.getParametersByPath = jest.fn(() => hierarchyParameterResponse)
        const taskOperations = new TaskOperations(ssm, taskParameters)
        await taskOperations.execute()
        expect(ssm.getParametersByPath).toBeCalledTimes(1)
    })

    test('Read mode hierarchy reads recursively', async () => {
        expect.assertions(1)
        const taskParameters = { ...defaultTaskParameters }
        taskParameters.readMode = 'hierarchy'
        taskParameters.variableNameTransform = 'none'
        taskParameters.parameterName = 'yes'
        taskParameters.parameterPath = 'params'
        const ssm = new SSM() as any
        ssm.getParametersByPath = jest.fn(args => {
            if (args.NextToken === '23') {
                return hierarchyParameterResponse
            } else {
                return hierarchyParameterResponseMultiple
            }
        })
        const taskOperations = new TaskOperations(ssm, taskParameters)
        await taskOperations.execute()
        expect(ssm.getParametersByPath).toBeCalledTimes(2)
    })
})
