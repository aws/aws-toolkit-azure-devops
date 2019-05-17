/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import tl = require('vsts-task-lib/task')

export const defaultTimeoutInMins: number = 60

// Retrieves the declared outputs of the stack and posts as either individual variables,
// using the output member key as variable name, or a json-formatted blob with a variable
// name of the stack name suffixed with 'Outputs'
export async function captureStackOutputs(
    cloudFormationClient: CloudFormation,
    stackName: string,
    asJsonBlob: boolean,
    asSecureVars: boolean
): Promise<void> {
    const response = await cloudFormationClient
        .describeStacks({
            StackName: stackName
        })
        .promise()

    try {
        const stack = response.Stacks[0]
        if (asJsonBlob) {
            console.log(tl.loc('ProcessingStackOutputsToJsonBlobBuildVariable'))
            const blob = JSON.stringify(stack.Outputs)
            const varName = `${stackName}Outputs`
            console.log(tl.loc('CreatingStackOutputVariable', varName))
            tl.setVariable(varName, blob, asSecureVars)
        } else {
            console.log(tl.loc('ProcessingStackOutputsToBuildVariables'))
            stack.Outputs.forEach(o => {
                console.log(tl.loc('CreatingStackOutputVariable', o.OutputKey))
                tl.setVariable(o.OutputKey, o.OutputValue, asSecureVars)
            })
        }
    } catch (err) {
        console.log(tl.loc('ErrorRetrievingStackOutputs', stackName, err))
    }
}

// Stacks 'created' with a change set are not fully realised until the change set
// executes, so we inspect whether resources exist in order to know which kind
// of 'waiter' to use (create complete, update complete) when running a stack update.
// It's not enough to know that the stack exists.
export async function testStackHasResources(cloudFormationClient: CloudFormation, stackName: string): Promise<boolean> {
    try {
        const response = await cloudFormationClient.describeStackResources({ StackName: stackName }).promise()

        return response.StackResources && response.StackResources.length > 0
    } catch (err) {
        return false
    }
}

export async function waitForStackUpdate(cloudFormationClient: CloudFormation, stackName: string): Promise<void> {
    console.log(tl.loc('WaitingForStackUpdate', stackName))
    try {
        await cloudFormationClient.waitFor('stackUpdateComplete', { StackName: stackName }).promise()
        console.log(tl.loc('StackUpdated', stackName))
    } catch (err) {
        throw new Error(tl.loc('StackUpdateFailed', stackName, (err as Error).message))
    }
}

export function setWaiterParams(stackName: string, timeout: number, changeSetName?: string): any {
    if (timeout !== defaultTimeoutInMins) {
        console.log(tl.loc('SettingCustomTimeout', timeout))
    }

    const p: any = {
        StackName: stackName,
        $waiter: {
            maxAttempts: Math.round((timeout * 60) / 15)
        }
    }

    if (changeSetName) {
        ;(p as any).ChangeSetName = changeSetName
    }

    return p
}

export async function testStackExists(cloudFormationClient: CloudFormation, stackName: string): Promise<string> {
    console.log(tl.loc('CheckingForStackExistence', stackName))

    try {
        const response: CloudFormation.DescribeStacksOutput = await cloudFormationClient
            .describeStacks({
                StackName: stackName
            })
            .promise()
        if (response.Stacks && response.Stacks.length > 0) {
            return response.Stacks[0].StackId
        }
    } catch (err) {
        console.log(tl.loc('StackLookupFailed', stackName, err))
    }

    return undefined
}

export async function testChangeSetExists(
    cloudFormationClient: CloudFormation,
    changeSetName: string,
    stackName: string
): Promise<boolean> {
    try {
        console.log(tl.loc('CheckingForExistingChangeSet', changeSetName, stackName))
        const response = await cloudFormationClient
            .describeChangeSet({ ChangeSetName: changeSetName, StackName: stackName })
            .promise()
        console.log(tl.loc('ChangeSetExists', changeSetName, response.Status))

        return true
    } catch (err) {
        console.log(tl.loc('ChangeSetLookupFailed', changeSetName, (err as Error).message))
    }

    return false
}
