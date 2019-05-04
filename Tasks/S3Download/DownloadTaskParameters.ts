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

    // options for Server-side encryption Key Management
    public static readonly noneOrAWSManagedKeyValue: string = 'noneOrAWSManaged';
    public static readonly customerManagedKeyValue: string = 'customerManaged';

    public static readonly aes256AlgorithmValue: string = 'AES256';

    public bucketName: string;
    public sourceFolder: string;
    public targetFolder: string;
    public globExpressions: string[];
    public overwrite: boolean;
    public forcePathStyleAddressing: boolean;
    public flattenFolders: boolean;
    public keyManagement: string;
    public customerKey: Buffer;

    constructor() {
        super();
        try {
            this.bucketName = tl.getInput('bucketName', true);
            this.sourceFolder = tl.getPathInput('sourceFolder', false, false);
            this.targetFolder = tl.getPathInput('targetFolder', true, false);
            this.globExpressions = tl.getDelimitedInput('globExpressions', '\n', true);
            this.overwrite = tl.getBoolInput('overwrite', false);
            this.forcePathStyleAddressing = tl.getBoolInput('forcePathStyleAddressing', false);
            this.flattenFolders = tl.getBoolInput('flattenFolders', false);

            this.keyManagement = tl.getInput('keyManagement', false);
            if (this.keyManagement === TaskParameters.customerManagedKeyValue) {
                const customerKey = tl.getInput('customerKey', true);
                this.customerKey = Buffer.from(customerKey, 'hex');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
