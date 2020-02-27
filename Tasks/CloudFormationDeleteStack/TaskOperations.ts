/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import { Stack } from 'aws-sdk/clients/cloudformation'
import * as tl from 'azure-pipelines-task-lib/task'
import { sleep } from 'Common/vstsUtils'
import { TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly cloudFormationClient: CloudFormation,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        const stack = await this.verifyResourcesExist(this.taskParameters.stackName)

        if (this.taskParameters.deleteUpdateInProgress && stack.StackStatus === 'UPDATE_IN_PROGRESS') {
            await this.cloudFormationClient.cancelUpdateStack({ StackName: this.taskParameters.stackName }).promise()
            await this.waitForStackRollbackComplete(this.taskParameters.stackName)
        }

        console.log(tl.loc('RequestingStackDeletion', this.taskParameters.stackName))
        await this.cloudFormationClient
            .deleteStack({
                StackName: this.taskParameters.stackName
            })
            .promise()
        await this.waitForStackDeletion(this.taskParameters.stackName)

        console.log(tl.loc('TaskCompleted'))
    }

    private async verifyResourcesExist(stackName: string): Promise<Stack> {
        try {
            const response = await this.cloudFormationClient.describeStacks({ StackName: stackName }).promise()
            if (response.$response.error) {
                throw response.$response.error
            }

            const stack = response?.Stacks?.[0]
            if (stack) {
                return stack
            }
            throw new Error('No stack was returned')
        } catch (err) {
            throw new Error(tl.loc('StackDoesNotExist', stackName))
        }
    }

    private async waitForStackRollbackComplete(stackName: string): Promise<void> {
        console.log(tl.loc('WaitingForStackStopRollback', stackName))
        try {
            // Retry for 60 min. Cannot use normal waiter because we weant to listen for all final status.
            for (let i = 0; i < 120; i++) {
                await sleep(30 * 1000)
                const stack = await this.verifyResourcesExist(stackName)
                if (stack.StackStatus.endsWith('FAILED') || stack.StackStatus.endsWith('COMPLETE')) {
                    console.log(tl.loc('StackDoneRollingBack', stackName, stack.StackStatus))

                    return
                }
            }
        } catch (err) {
            throw new Error(tl.loc('StackRollbackFailed', stackName, (err as Error).message))
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
