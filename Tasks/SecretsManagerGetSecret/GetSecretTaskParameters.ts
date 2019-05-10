/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase'
import tl = require('vsts-task-lib/task')

export class TaskParameters extends AWSTaskParametersBase {

    public secretIdOrName: string
    public variableName: string
    public versionId: string
    public versionStage: string

    public constructor() {
        super()
        try {
            this.secretIdOrName = tl.getInput('secretIdOrName', true)
            this.variableName = tl.getInput('variableName', true)
            this.versionId = tl.getInput('versionId', false)
            this.versionStage = tl.getInput('versionStage', false)
        } catch (error) {
            throw new Error(`${error}`)
        }
    }
}
