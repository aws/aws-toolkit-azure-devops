/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import CloudFormation = require('aws-sdk/clients/cloudformation');

export class CloudFormationUtils {
    // Retrieves the declared outputs of the stack and posts as either individual variables,
    // using the output member key as variable name, or a json-formatted blob with a variable
    // name of the stack name suffixed with 'Outputs'
    public static async captureStackOutputs(cloudFormationClient: CloudFormation,
        stackName: string,
        asJsonBlob: boolean,
        asSecureVars: boolean): Promise<void> {

        const response = await cloudFormationClient.describeStacks({
            StackName: stackName
        }).promise();

        try {
            const stack = response.Stacks[0];
            if (asJsonBlob) {
                console.log(tl.loc('ProcessingStackOutputsToJsonBlobBuildVariable'));
                const blob = JSON.stringify(stack.Outputs);
                const varName = `${stackName}Outputs`;
                console.log(tl.loc('CreatingStackOutputVariable', varName));
                tl.setVariable(varName, blob, asSecureVars);
            } else {
                console.log(tl.loc('ProcessingStackOutputsToBuildVariables'));
                stack.Outputs.forEach((o) => {
                    console.log(tl.loc('CreatingStackOutputVariable', o.OutputKey));
                    tl.setVariable(o.OutputKey, o.OutputValue, asSecureVars);
                });
            }
        } catch (err) {
            console.log(tl.loc('ErrorRetrievingStackOutputs', stackName, err));
        }
    }
}
