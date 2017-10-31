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
    private readonly defaultPathSubstitutionCharacter: string = '_';

    public readMode: string;
    public parameterName: string;
    public parameterPath: string;
    public recursive: boolean;
    public variableNameTransform: string;
    public customVariableName: string;
    public pathSubstitutionCharacter: string = this.defaultPathSubstitutionCharacter;

    constructor() {
        super();
        try {
            this.readMode = tl.getInput('readMode', true);
            if (this.readMode === 'single') {
                  this.parameterName = tl.getInput('parameterName', true);
                  this.variableNameTransform = tl.getInput('singleNameTransform', false);
            } else {
                  this.parameterPath = tl.getInput('parameterPath', true);
                  this.recursive = tl.getBoolInput('recursive', false);
                  this.variableNameTransform = tl.getInput('hierarchyNameTransform', false);
            }

            switch (this.variableNameTransform) {
                case 'substitute': {
                    this.pathSubstitutionCharacter = tl.getInput('pathSubstitutionCharacter', false);
                    if (this.pathSubstitutionCharacter && this.pathSubstitutionCharacter.length > 1) {
                        this.pathSubstitutionCharacter = this.pathSubstitutionCharacter[0];
                    } else {
                        this.pathSubstitutionCharacter = this.defaultPathSubstitutionCharacter;
                    }
                }
                break;

                case 'custom': {
                    this.customVariableName = tl.getInput('customVariableName', false);
                    if (!this.customVariableName || this.customVariableName.length === 0) {
                        throw new Error(tl.loc('MissingVariableName'));
                    }
                }
                break;

                default: break;
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
