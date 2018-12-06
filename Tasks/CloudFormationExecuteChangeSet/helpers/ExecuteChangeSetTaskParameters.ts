/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase';

export class TaskParameters extends AWSTaskParametersBase {

    public static readonly ignoreStackOutputs: string = 'ignore';
    public static readonly stackOutputsAsVariables: string = 'asVariables';
    public static readonly stackOutputsAsJson: string = 'asJSON';

    public changeSetName: string;
    public stackName: string;
    public outputVariable: string;
    public captureStackOutputs: string;
    public captureAsSecuredVars: boolean;

    constructor() {
        super();
        try {
            this.changeSetName = tl.getInput('changeSetName', true);
            this.stackName = tl.getInput('stackName', true);
            this.outputVariable = tl.getInput('outputVariable', false);
            this.captureStackOutputs = tl.getInput('captureStackOutputs', false);
            this.captureAsSecuredVars = tl.getBoolInput('captureAsSecuredVars', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
