/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import tl = require('vsts-task-lib/task')

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
