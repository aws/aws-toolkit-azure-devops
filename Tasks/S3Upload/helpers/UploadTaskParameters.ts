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

    // options for Server-side encryption Key Management; 'none' disables SSE
    public static readonly noKeyManagementValue: string = 'none';
    public static readonly awsKeyManagementValue: string = 'awsManaged';
    public static readonly customerKeyManagementValue: string = 'customerManaged';

    // options for encryption algorithm when key management is set to 'aws';
    // customer managed keys always use AES256
    public static readonly awskmsAlgorithmValue: string = 'KMS'; // translated to aws:kms when used in api call
    public static readonly aes256AlgorithmValue: string = 'AES256';

    public bucketName: string;
    public sourceFolder: string;
    public targetFolder: string;
    public flattenFolders: boolean;
    public overwrite: boolean;
    public globExpressions: string[];
    public filesAcl: string;
    public createBucket: boolean;
    public contentType: string;
    public forcePathStyleAddressing: boolean;
    public storageClass: string;
    public keyManagement: string;
    public encryptionAlgorithm: string;
    public kmsMasterKeyId: string;
    public customerKey: Buffer;

    constructor() {
        super();
        try {
            this.bucketName = tl.getInput('bucketName', true);
            this.overwrite = tl.getBoolInput('overwrite', false);
            this.flattenFolders = tl.getBoolInput('flattenFolders', false);
            this.sourceFolder = tl.getPathInput('sourceFolder', true, true);
            this.targetFolder = tl.getInput('targetFolder', false);
            this.globExpressions = tl.getDelimitedInput('globExpressions', '\n', true);
            this.filesAcl = tl.getInput('filesAcl', false);
            this.createBucket = tl.getBoolInput('createBucket');
            this.contentType = tl.getInput('contentType', false);
            this.forcePathStyleAddressing = tl.getBoolInput('forcePathStyleAddressing', false);
            this.storageClass = tl.getInput('storageClass', false);
            if (!this.storageClass) {
                this.storageClass = 'STANDARD';
            }

            this.keyManagement = tl.getInput('keyManagement', false);
            if (this.keyManagement && this.keyManagement !== TaskParameters.noKeyManagementValue) {
                switch (this.keyManagement) {
                    case TaskParameters.awsKeyManagementValue: {
                        const algorithm = tl.getInput('encryptionAlgorithm', true);
                        if (algorithm === TaskParameters.awskmsAlgorithmValue) {
                            this.encryptionAlgorithm = 'aws:kms';
                        } else {
                            this.encryptionAlgorithm = TaskParameters.aes256AlgorithmValue;
                        }
                        this.kmsMasterKeyId = tl.getInput('kmsMasterKeyId', algorithm === TaskParameters.awskmsAlgorithmValue);
                    }
                    break;

                    case TaskParameters.customerKeyManagementValue: {
                        this.encryptionAlgorithm = TaskParameters.aes256AlgorithmValue;
                        const customerKey = tl.getInput('customerKey', true);
                        this.customerKey = Buffer.from(customerKey, 'hex');
                    }
                    break;
                }
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
