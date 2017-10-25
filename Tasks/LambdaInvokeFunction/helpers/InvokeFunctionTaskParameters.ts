/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import sdkutils = require('sdkutils/sdkutils');

export class TaskParameters extends sdkutils.AWSTaskParametersBase {
    public functionName: string;
    public payload: string;
    public invocationType: string;
    public logType: string;
    public outputVariable: string;

    constructor() {
        super();
        try {
            this.functionName = tl.getInput('functionName', true);
            this.payload = tl.getInput('payload', false);
            this.invocationType = tl.getInput('invocationType', false);
            this.logType = tl.getInput('logType', false);
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
