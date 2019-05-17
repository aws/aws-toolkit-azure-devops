/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task')
import CloudFormation = require('aws-sdk/clients/cloudformation')
import { SdkUtils } from 'sdkutils/sdkutils'
import { TaskParameters } from './ExecuteChangeSetTaskParameters'
import {
    captureStackOutputs,
    testStackHasResources,
    waitForStackCreation,
    waitForStackUpdate
} from 'Common/cloudformationutils'

export class TaskOperations {
    public constructor(public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        await this.createServiceClients()

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

            if (this.taskParameters.captureStackOutputs !== TaskParameters.ignoreStackOutputs) {
                await captureStackOutputs(
                    this.cloudFormationClient,
                    this.taskParameters.stackName,
                    this.taskParameters.captureStackOutputs === TaskParameters.stackOutputsAsJson,
                    this.taskParameters.captureAsSecuredVars
                )
            }

            console.log(tl.loc('TaskCompleted', this.taskParameters.changeSetName))
        } catch (err) {
            console.error(tl.loc('ExecuteChangeSetFailed', err.message), err)
            throw err
        }
    }

    private cloudFormationClient: CloudFormation

    private async createServiceClients(): Promise<void> {
        const cfnOpts: CloudFormation.ClientConfiguration = {
            apiVersion: '2010-05-15'
        }
        this.cloudFormationClient = await SdkUtils.createAndConfigureSdkClient(
            CloudFormation,
            cfnOpts,
            this.taskParameters,
            tl.debug
        )
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
