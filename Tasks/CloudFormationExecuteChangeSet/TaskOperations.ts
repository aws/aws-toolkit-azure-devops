/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import {
    captureStackOutputs,
    testStackHasResources,
    waitForStackCreation,
    waitForStackUpdate
} from 'Common/cloudformationutils'
import tl = require('vsts-task-lib/task')
import { ignoreStackOutputs, stackOutputsAsJson, TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly cloudFormationClient: CloudFormation,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        const stackId = await this.verifyResourcesExist(
            this.taskParameters.changeSetName,
            this.taskParameters.stackName
        )
        let waitForUpdate: boolean = false
        if (stackId) {
            waitForUpdate = await testStackHasResources(this.cloudFormationClient, this.taskParameters.stackName)
        }

        console.log(tl.loc('ExecutingChangeSet', this.taskParameters.changeSetName, this.taskParameters.stackName))

        try {
            await this.cloudFormationClient
                .executeChangeSet({
                    ChangeSetName: this.taskParameters.changeSetName,
                    StackName: this.taskParameters.stackName
                })
                .promise()

            if (waitForUpdate) {
                await waitForStackUpdate(this.cloudFormationClient, this.taskParameters.stackName)
            } else {
                await waitForStackCreation(this.cloudFormationClient, this.taskParameters.stackName)
            }

            if (this.taskParameters.outputVariable) {
                console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable))
                tl.setVariable(this.taskParameters.outputVariable, stackId)
            }

            if (this.taskParameters.captureStackOutputs !== ignoreStackOutputs) {
                await captureStackOutputs(
                    this.cloudFormationClient,
                    this.taskParameters.stackName,
                    this.taskParameters.captureStackOutputs === stackOutputsAsJson,
                    this.taskParameters.captureAsSecuredVars
                )
            }

            console.log(tl.loc('TaskCompleted', this.taskParameters.changeSetName))
        } catch (err) {
            console.error(tl.loc('ExecuteChangeSetFailed', err.message), err)
            throw err
        }
    }

    private async verifyResourcesExist(changeSetName: string, stackName: string): Promise<string> {
        try {
            const request: CloudFormation.DescribeChangeSetInput = {
                ChangeSetName: changeSetName
            }
            if (stackName) {
                request.StackName = stackName
            }

            const response = await this.cloudFormationClient.describeChangeSet(request).promise()

            return response.StackId
        } catch (err) {
            throw new Error(tl.loc('ChangeSetDoesNotExist', changeSetName))
        }
    }
}
