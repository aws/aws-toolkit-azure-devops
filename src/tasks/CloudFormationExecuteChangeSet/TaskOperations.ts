/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import * as tl from 'azure-pipelines-task-lib/task'
import {
    captureStackOutputs,
    testStackHasResources,
    waitForStackCreation,
    waitForStackUpdate
} from 'lib/cloudformationutils'
import { ignoreStackOutputs, stackOutputsAsJson, TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly cloudFormationClient: CloudFormation,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        const changeSet = await this.verifyResourcesExist(
            this.taskParameters.changeSetName,
            this.taskParameters.stackName
        )
        let waitForUpdate = false
        const stackId = changeSet.StackId || ''
        if (stackId) {
            waitForUpdate = await testStackHasResources(this.cloudFormationClient, this.taskParameters.stackName)
        }

        try {
            const changeSetHasNoChanges =
                changeSet.Status === 'FAILED' &&
                changeSet.StatusReason ===
                    "The submitted information didn't contain changes. Submit different information to create a change set."

            if (changeSetHasNoChanges) {
                console.log(tl.loc('ExecutionSkipped', this.taskParameters.changeSetName))

                // Should we delete the failed change set?
                const request: CloudFormation.DeleteChangeSetInput = {
                    ChangeSetName: this.taskParameters.changeSetName
                }
                if (this.taskParameters.stackName) {
                    request.StackName = this.taskParameters.stackName
                }

                await this.cloudFormationClient.deleteChangeSet(request).promise()
            } else {
                console.log(
                    tl.loc('ExecutingChangeSet', this.taskParameters.changeSetName, this.taskParameters.stackName)
                )
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
            console.error(tl.loc('ExecuteChangeSetFailed', (err as Error).message), err)
            throw err
        }
    }

    private async verifyResourcesExist(
        changeSetName: string,
        stackName: string
    ): Promise<CloudFormation.DescribeChangeSetOutput> {
        try {
            const request: CloudFormation.DescribeChangeSetInput = {
                ChangeSetName: changeSetName
            }
            if (stackName) {
                request.StackName = stackName
            }

            return await this.cloudFormationClient.describeChangeSet(request).promise()
        } catch (err) {
            throw new Error(tl.loc('ChangeSetDoesNotExist', changeSetName))
        }
    }
}
