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

    public secretIdOrName: string;
    public variableName: string;
    public versionId: string;
    public versionStage: string;

    constructor() {
        super();
        try {
            this.secretIdOrName = tl.getInput('secretIdOrName', true);
            this.variableName = tl.getInput('variableName', true);
            this.versionId = tl.getInput('versionId', false);
            this.versionStage = tl.getInput('versionStage', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
