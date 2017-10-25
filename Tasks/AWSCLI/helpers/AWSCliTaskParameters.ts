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
    public awsCliCommand: string;
    public awsCliSubCommand: string;
    public awsCliParameters: string;
    public failOnStandardError: boolean;

    constructor() {
        super();
        try {
            this.awsCliCommand = tl.getInput('awsCommand', true);
            this.awsCliSubCommand = tl.getInput('awsSubCommand', true);
            this.awsCliParameters = tl.getInput('awsArguments', false);
            this.failOnStandardError = tl.getBoolInput('failOnStandardError');
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
