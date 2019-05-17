/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import tl = require('vsts-task-lib/task')
import { TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly cloudFormationClient: CloudFormation,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        await this.verifyResourcesExist(this.taskParameters.stackName)

        console.log(tl.loc('RequestingStackDeletion', this.taskParameters.stackName))
        await this.cloudFormationClient
            .deleteStack({
                StackName: this.taskParameters.stackName
            })
            .promise()
        await this.waitForStackDeletion(this.taskParameters.stackName)

        console.log(tl.loc('TaskCompleted'))
    }

    private async verifyResourcesExist(stackName: string): Promise<void> {
        try {
            await this.cloudFormationClient.describeStacks({ StackName: stackName }).promise()
        } catch (err) {
            throw new Error(tl.loc('StackDoesNotExist', stackName))
        }
    }

    private async waitForStackDeletion(stackName: string): Promise<void> {
        console.log(tl.loc('WaitingForStackDeletion', stackName))
        try {
            await this.cloudFormationClient.waitFor('stackDeleteComplete', { StackName: stackName }).promise()
            console.log(tl.loc('StackDeleted'))
        } catch (err) {
            throw new Error(tl.loc('StackDeletionFailed', stackName, (err as Error).message))
        }
    }
}
