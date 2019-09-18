/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import Lambda = require('aws-sdk/clients/lambda')
import * as tl from 'azure-pipelines-task-lib/task'
import { TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(public readonly lambdaClient: Lambda, public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        await this.verifyResourcesExist(this.taskParameters.functionName)

        console.log(tl.loc('InvokingFunction', this.taskParameters.functionName))

        const params: Lambda.InvocationRequest = {
            FunctionName: this.taskParameters.functionName
        }
        if (this.taskParameters.payload) {
            params.Payload = JSON.stringify(this.taskParameters.payload)
        }
        if (this.taskParameters.invocationType) {
            params.InvocationType = this.taskParameters.invocationType
        }
        if (this.taskParameters.logType) {
            params.LogType = this.taskParameters.logType
        }
        try {
            const data: Lambda.InvocationResponse = await this.lambdaClient.invoke(params).promise()
            let outValue: string = ''
            if (data.Payload) {
                outValue = data.Payload.toString()
            }

            // don't echo the value into the normal logs in case it contains sensitive data
            tl.debug(tl.loc('ReceivedOutput', outValue))

            if (this.taskParameters.outputVariable) {
                console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable))
                tl.setVariable(this.taskParameters.outputVariable, outValue)
            }

            console.log(tl.loc('TaskCompleted', this.taskParameters.functionName))
        } catch (err) {
            console.error(tl.loc('FunctionInvokeFailed'), err)
            throw err
        }
    }

    private async verifyResourcesExist(functionName: string): Promise<void> {
        try {
            await this.lambdaClient.getFunctionConfiguration({ FunctionName: functionName }).promise()
        } catch (err) {
            throw new Error(tl.loc('FunctionDoesNotExist', functionName))
        }
    }
}
