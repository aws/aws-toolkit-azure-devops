/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase'
import tl = require('vsts-task-lib/task')

export class TaskParameters extends AWSTaskParametersBase {

    // Options for the scriptType value
    public static readonly inlineScriptType: string = 'inline'
    public static readonly fileScriptType: string = 'filePath'

    public arguments: string

    public scriptType: string

    public filePath: string
    public inlineScript: string
    public disableAutoCwd: boolean
    public cwd: string
    public failOnStandardError: boolean

    public constructor() {
        super()
        try {
            this.arguments = tl.getInput('arguments', false)

            this.scriptType = tl.getInput('scriptType', true)
            if (this.scriptType === TaskParameters.fileScriptType) {
                this.filePath = tl.getPathInput('filePath', true, true)
            } else {
                this.inlineScript = tl.getInput('inlineScript', true)
            }

            this.disableAutoCwd = tl.getBoolInput('disableAutoCwd', false)
            this.cwd = tl.getPathInput('cwd', this.disableAutoCwd, false)
            this.failOnStandardError = tl.getBoolInput('failOnStandardError', false)
        } catch (error) {
            throw new Error(error.message)
        }
    }

}
