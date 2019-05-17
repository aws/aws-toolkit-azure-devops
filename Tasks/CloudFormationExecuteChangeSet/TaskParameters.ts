/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase'
import tl = require('vsts-task-lib/task')

export class TaskParameters extends AWSTaskParametersBase {
    public static readonly ignoreStackOutputs: string = 'ignore'
    public static readonly stackOutputsAsVariables: string = 'asVariables'
    public static readonly stackOutputsAsJson: string = 'asJSON'

    public changeSetName: string
    public stackName: string
    public outputVariable: string
    public captureStackOutputs: string
    public captureAsSecuredVars: boolean

    public constructor() {
        super()
        try {
            this.changeSetName = tl.getInput('changeSetName', true)
            this.stackName = tl.getInput('stackName', true)
            this.outputVariable = tl.getInput('outputVariable', false)
            this.captureStackOutputs = tl.getInput('captureStackOutputs', false)
            this.captureAsSecuredVars = tl.getBoolInput('captureAsSecuredVars', false)
        } catch (error) {
            throw new Error(error.message)
        }
    }
}
