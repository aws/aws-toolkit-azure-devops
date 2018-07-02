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

    // Options for the scriptType value
    public static readonly inlineScriptType: string = 'inline';
    public static readonly fileScriptType: string = 'filePath';

    public arguments: string;

    public scriptType: string;

    public filePath: string;
    public inlineScript: string;
    public disableAutoCwd: boolean;
    public cwd: string;
    public failOnStandardError: boolean;

    constructor() {
        super();
        try {
            this.arguments = tl.getInput('arguments', false);

            this.scriptType = tl.getInput('scriptType', true);
            if (this.scriptType === TaskParameters.fileScriptType) {
                this.filePath = tl.getPathInput('filePath', true, true);
            } else {
                this.inlineScript = tl.getInput('inlineScript', true);
            }

            this.disableAutoCwd = tl.getBoolInput('disableAutoCwd', false);
            this.cwd = tl.getPathInput('cwd', this.disableAutoCwd, false);
            this.failOnStandardError = tl.getBoolInput('failOnStandardError', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }

}