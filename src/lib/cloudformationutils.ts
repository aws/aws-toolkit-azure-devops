/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import tl = require('azure-pipelines-task-lib/task')

export const defaultTimeoutInMins = 60

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
        if (!response.Stacks) {
            throw new Error('No stacks in response')
        }
        const stack = response.Stacks[0]
        if (asJsonBlob) {
            console.log(tl.loc('ProcessingStackOutputsToJsonBlobBuildVariable'))
            const blob = JSON.stringify(stack.Outputs)
            const varName = `${stackName}Outputs`
            console.log(tl.loc('CreatingStackOutputVariable', varName))
            tl.setVariable(varName, blob, asSecureVars)
        } else {
            console.log(tl.loc('ProcessingStackOutputsToBuildVariables'))
            if (stack.Outputs) {
                stack.Outputs.forEach(o => {
                    if (o.OutputKey) {
                        console.log(tl.loc('CreatingStackOutputVariable', o.OutputKey))
                        tl.setVariable(o.OutputKey, `${o.OutputValue}`, asSecureVars)
                    }
                })
            }
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

        return response.StackResources !== undefined && response.StackResources.length > 0
    } catch (err) {
        return false
    }
}

export async function waitForStackUpdate(
    cloudFormationClient: CloudFormation,
    stackName: string,
    timeoutInMins: number = defaultTimeoutInMins
): Promise<void> {
    console.log(tl.loc('WaitingForStackUpdate', stackName))
    try {
        const params: any = setWaiterParams(stackName, timeoutInMins)
        await cloudFormationClient.waitFor('stackUpdateComplete', params).promise()
        console.log(tl.loc('StackUpdated', stackName))
    } catch (err) {
        throw new Error(tl.loc('StackUpdateFailed', stackName, (err as Error).message))
    }
}

export async function waitForStackCreation(
    cloudFormationClient: CloudFormation,
    stackName: string,
    timeoutInMins: number = defaultTimeoutInMins
): Promise<void> {
    console.log(tl.loc('WaitingForStackCreation', stackName))
    try {
        const params: any = setWaiterParams(stackName, timeoutInMins)
        await cloudFormationClient.waitFor('stackCreateComplete', params).promise()
        console.log(tl.loc('StackCreated', stackName))
    } catch (err) {
        throw new Error(tl.loc('StackCreationFailed', stackName, err.message))
    }
}

export function setWaiterParams(stackName: string, timeout: number, changeSetName?: string): any {
    if (timeout !== defaultTimeoutInMins) {
        console.log(tl.loc('SettingCustomTimeout', timeout))
    }

    const p: any = {
        StackName: stackName,
        // The magic number here comes from how often the calls occur, specified by the client
        // Cloudformation specifies every 30 seconds
        $waiter: {
            maxAttempts: Math.round((timeout * 60) / 30)
        }
    }

    if (changeSetName) {
        p.ChangeSetName = changeSetName
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
        if (response.Stacks && response.Stacks.length > 0 && response.Stacks[0].StackId) {
            return response.Stacks[0].StackId
        }
    } catch (err) {
        console.log(tl.loc('StackLookupFailed', stackName, err))
    }

    return ''
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

// If there were no changes, a validation error is thrown which we want to suppress
// (issue #28) instead of erroring out and failing the build. The only way to determine
// this is to inspect the message in conjunction with the status code, and over time
// there has been some variance in service behavior based on how we attempted to make the
// change. So now detect either of the errors, and for either if the message indicates
// a no-op.
export function isNoWorkToDoValidationError(errCodeOrStatus?: string, errMessage?: string): boolean {
    const knownNoOpErrorMessages = [
        /No updates are to be performed./,
        /^The submitted information didn't contain changes./
    ]

    errCodeOrStatus = errCodeOrStatus || ''
    const message = errMessage || ''
    return (
        (errCodeOrStatus.search(/ValidationError/) !== -1 || errCodeOrStatus.search(/FAILED/) !== -1) &&
        knownNoOpErrorMessages.some(element => message.search(element) !== -1)
    )
}
