/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase';

export class TaskParameters {
    public awsTaskParametersBase: AWSTaskParametersBase;
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

    public static build() : TaskParameters {
        const taskParameters: TaskParameters = new TaskParameters();
        try {
            taskParameters.awsTaskParametersBase = new AWSTaskParametersBase();
            taskParameters.bucketName = tl.getInput('bucketName', true);
            taskParameters.sourceFolder = tl.getPathInput('sourceFolder', false, false);
            taskParameters.targetFolder = tl.getPathInput('targetFolder', true, false);
            taskParameters.globExpressions = tl.getDelimitedInput('globExpressions', '\n', true);
            taskParameters.overwrite = tl.getBoolInput('overwrite', false);
            taskParameters.forcePathStyleAddressing = tl.getBoolInput('forcePathStyleAddressing', false);
            taskParameters.flattenFolders = tl.getBoolInput('flattenFolders', false);

            taskParameters.keyManagement = tl.getInput('keyManagement', false);
            if (taskParameters.keyManagement === TaskParameters.customerManagedKeyValue) {
                const customerKey = tl.getInput('customerKey', true);
                taskParameters.customerKey = Buffer.from(customerKey, 'hex');
            }
        } catch (error) {
            throw new Error(error.message);
        }
        return taskParameters;
    }
}
