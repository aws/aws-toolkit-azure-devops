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

    // options for Server-side encryption Key Management; 'none' disables SSE
    public readonly noKeyManagementValue: string = 'none';
    public readonly awsKeyManagementValue: string = 'awsManaged';
    public readonly customerKeyManagementValue: string = 'customerManaged';

    // options for encryption algorithm when key management is set to 'aws';
    // customer managed keys always use AES256
    public readonly awskmsAlgorithmValue: string = 'KMS'; // translated to aws:kms when used in api call
    public readonly aes256AlgorithmValue: string = 'AES256';

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
            if (this.keyManagement && this.keyManagement !== this.noKeyManagementValue) {
                switch (this.keyManagement) {
                    case this.awsKeyManagementValue: {
                        const algorithm = tl.getInput('encryptionAlgorithm', true);
                        if (algorithm === this.awskmsAlgorithmValue) {
                            this.encryptionAlgorithm = 'aws:kms';
                        } else {
                            this.encryptionAlgorithm = this.aes256AlgorithmValue;
                        }
                        this.kmsMasterKeyId = tl.getInput('kmsMasterKeyId', algorithm === this.awskmsAlgorithmValue);
                    }
                    break;

                    case this.customerKeyManagementValue: {
                        this.encryptionAlgorithm = this.aes256AlgorithmValue;
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
