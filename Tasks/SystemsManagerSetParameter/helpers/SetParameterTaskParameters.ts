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

    public static readonly simpleStringType: string = 'String';
    public static readonly stringListType: string = 'StringList';
    public static readonly secureStringType: string = 'SecureString';

    public parameterName: string;
    public parameterType: string;
    public parameterValue: string;
    public encryptionKeyId: string;

    constructor() {
        super();
        try {
            this.parameterName = tl.getInput('parameterName', true);
            this.parameterType = tl.getInput('parameterType', true);
            this.parameterValue = tl.getInput('parameterValue', true);
            if (this.parameterType === TaskParameters.secureStringType) {
                this.encryptionKeyId = tl.getInput('encryptionKeyId', false);
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
