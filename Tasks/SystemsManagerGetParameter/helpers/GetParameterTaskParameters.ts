/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

  import tl = require('vsts-task-lib/task');
  import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase';

  export class TaskParameters extends AWSTaskParametersBase {

    public readMode: string;
    public parameterName: string;
    public parameterVersion: number;
    public parameterPath: string;
    public recursive: boolean;
    public variableNameTransform: string;
    public customVariableName: string;
    public replacementPattern: string;
    public replacementText: string;
    public globalMatch: boolean;
    public caseInsensitiveMatch: boolean;

    constructor() {
        super();
        try {
            this.readMode = tl.getInput('readMode', true);
            if (this.readMode === 'single') {
                  this.parameterName = tl.getInput('parameterName', true);
                  const versionstring = tl.getInput('parameterVersion', false);
                  if (versionstring) {
                    const pv = parseInt(versionstring, 10);
                    if (pv > 0) {
                        this.parameterVersion = pv;
                    } else {
                        throw new Error(tl.loc('InvalidParameterVersion', pv));
                    }
                  }
                  this.variableNameTransform = tl.getInput('singleNameTransform', false);
            } else {
                  this.parameterPath = tl.getInput('parameterPath', true);
                  this.recursive = tl.getBoolInput('recursive', false);
                  this.variableNameTransform = tl.getInput('hierarchyNameTransform', false);
            }

            switch (this.variableNameTransform) {
                case 'substitute': {
                    this.replacementPattern = tl.getInput('replacementPattern', true);
                    this.replacementText = tl.getInput('replacementText', false) || '';
                    this.globalMatch = tl.getBoolInput('globalMatch', false);
                    this.caseInsensitiveMatch = tl.getBoolInput('caseInsensitiveMatch', false);
                }
                break;

                case 'custom': {
                    this.customVariableName = tl.getInput('customVariableName', true);
                }
                break;

                default: break;
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
