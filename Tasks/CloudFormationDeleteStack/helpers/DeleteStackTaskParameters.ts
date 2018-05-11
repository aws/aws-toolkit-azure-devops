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
    public stackName: string;

    constructor() {
        super();
        try {
            this.stackName = tl.getInput('stackName', true);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
