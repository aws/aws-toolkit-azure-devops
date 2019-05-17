/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import SSM = require('aws-sdk/clients/ssm')
import { transformParameterToVariableName } from 'Common/ssm'
import tl = require('vsts-task-lib/task')
import { TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(public readonly ssmClient: SSM, public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        switch (this.taskParameters.readMode) {
            case 'single':
                await this.readSingleParameterValue()
                break

            case 'hierarchy':
                await this.readParameterHierarchy()
                break

            default:
                throw new Error(tl.loc('UnknownReadMode', this.taskParameters.readMode))
        }

        console.log(tl.loc('TaskCompleted'))
    }

    // Reads a single parameter value and stores it into the supplied variable name. SecureString parameter
    // types are stored as secret variables.
    private async readSingleParameterValue(): Promise<void> {
        const outputVariableName = transformParameterToVariableName(this.taskParameters)

        let parameterName = this.taskParameters.parameterName
        if (this.taskParameters.parameterVersion) {
            parameterName += `:${this.taskParameters.parameterVersion}`
        }
        const response = await this.ssmClient
            .getParameter({
                Name: parameterName,
                WithDecryption: true
            })
            .promise()

        const isSecret = response.Parameter.Type === 'SecureString'
        console.log(tl.loc('SettingVariable', outputVariableName, parameterName, isSecret))
        tl.setVariable(outputVariableName, response.Parameter.Value, isSecret)
    }

    // Reads a hierarchy of parameters identified by a common name path. SecureString parameter types are
    // stored as secret variables.
    private async readParameterHierarchy(): Promise<void> {
        // do the path name prefixing as a convenience if the user failed to supply it
        let finalParameterPath: string
        if (this.taskParameters.parameterPath.startsWith('/')) {
            finalParameterPath = this.taskParameters.parameterPath
        } else {
            finalParameterPath = '/' + this.taskParameters.parameterPath
        }

        console.log(tl.loc('ReadingParameterHierarchy', finalParameterPath, this.taskParameters.recursive))

        let nextToken: string
        do {
            const response = await this.ssmClient
                .getParametersByPath({
                    Path: finalParameterPath,
                    Recursive: this.taskParameters.recursive,
                    WithDecryption: true,
                    NextToken: nextToken
                })
                .promise()

            for (const p of response.Parameters) {
                const outputVariableName = transformParameterToVariableName(this.taskParameters, p.Name)
                const isSecret = p.Type === 'SecureString'
                console.log(tl.loc('SettingVariable', outputVariableName, p.Name, isSecret))

                tl.setVariable(outputVariableName, p.Value, isSecret)
            }

            nextToken = response.NextToken
        } while (nextToken)
    }
}
