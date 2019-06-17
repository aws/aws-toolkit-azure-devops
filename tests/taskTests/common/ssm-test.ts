/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { transformParameterToVariableName } from 'Common/ssm'

const defaultTaskParameters = {
    parameterName: '',
    variableNameTransform: '',
    globalMatch: false,
    caseInsensitiveMatch: false,
    replacementPattern: '',
    replacementText: '',
    customVariableName: ''
}

describe('System Manager Common', () => {
    test('Throws if no transform type specified', () => {
        expect.assertions(1)
        try {
            transformParameterToVariableName(defaultTaskParameters)
        } catch (e) {
            expect(`${e}`).toContain('Unknown name transform')
        }
    })

    test('Uses paramaterName if no inputParamaterName specified', () => {
        const taskParams = { ...defaultTaskParameters }
        taskParams.variableNameTransform = 'none'
        taskParams.parameterName = 'variable'
        const response = transformParameterToVariableName(taskParams)
        expect(response).toContain('variable')
    })

    test('Leaf transform works properly', () => {
        const taskParams = { ...defaultTaskParameters }
        taskParams.variableNameTransform = 'leaf'
        taskParams.parameterName = 'variable'
        const response = transformParameterToVariableName(taskParams, 'hello/there/ok/')
        expect(response).toContain('ok')
    })

    test('Substitute transform works properly', () => {
        const taskParams = { ...defaultTaskParameters }
        taskParams.variableNameTransform = 'substitute'
        taskParams.replacementPattern = 'what'
        taskParams.replacementText = '0000'
        const response = transformParameterToVariableName(taskParams, 'what? ok what?')
        expect(response).toContain('0000? ok what?')
        taskParams.globalMatch = true
        const response2 = transformParameterToVariableName(taskParams, 'what? ok what?')
        expect(response2).toContain('0000? ok 0000?')
        taskParams.caseInsensitiveMatch = true
        const response3 = transformParameterToVariableName(taskParams, 'WhaT? ok what?')
        expect(response3).toContain('0000? ok 0000?')
    })

    test('Custom transform works properly', () => {
        const taskParams = { ...defaultTaskParameters }
        taskParams.variableNameTransform = 'custom'
        taskParams.parameterName = 'variable'
        taskParams.customVariableName = 'variable 2'
        const response = transformParameterToVariableName(taskParams)
        expect(response).toContain('variable 2')
    })
})
