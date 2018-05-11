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

    // possible values for the deploymentMode parameter
    public static readonly deployCodeOnly: string = 'codeonly';
    public static readonly deployCodeAndConfig: string = 'codeandconfiguration';

    // possible values for the codeLocation parameter
    public static readonly updateFromLocalFile: string = 'localfile';
    public static readonly updateFromS3Object: string = 's3object';

    public deploymentMode: string;
    public functionName: string;
    public functionHandler: string;
    public runtime: string;
    public codeLocation: string;
    public localZipFile: string;
    public s3Bucket: string;
    public s3ObjectKey: string;
    public s3ObjectVersion: string;
    public roleARN: string;
    public description: string;
    public memorySize: number = 128;
    public timeout: number = 3;
    public publish: boolean;
    public deadLetterARN: string;
    public kmsKeyARN: string;
    public environment: string[];
    public tags: string[];
    public securityGroups: string[];
    public subnets: string[];
    public tracingConfig: string;
    public outputVariable: string;

    constructor() {
        super();
        try {
            this.deploymentMode = tl.getInput('deploymentMode', true);
            const requireBasicConfigFields = this.deploymentMode === TaskParameters.deployCodeAndConfig;

            this.functionName = tl.getInput('functionName', true);
            this.functionHandler = tl.getInput('functionHandler', requireBasicConfigFields);
            this.runtime = tl.getInput('runtime', requireBasicConfigFields);
            this.roleARN = tl.getInput('roleARN', requireBasicConfigFields);

            this.codeLocation = tl.getInput('codeLocation', true);
            if (this.codeLocation === TaskParameters.updateFromLocalFile) {
                this.localZipFile = tl.getPathInput('localZipFile', true, true);
            } else {
                this.s3Bucket = tl.getInput('s3Bucket', true);
                this.s3ObjectKey = tl.getInput('s3ObjectKey', true);
                this.s3ObjectVersion = tl.getInput('s3ObjectVersion', false);
            }

            this.description = tl.getInput('description', false);
            const memorySizeTmp = tl.getInput('memorySize', false);
            if (memorySizeTmp) {
                this.memorySize = parseInt(memorySizeTmp, 10);
            }
            const timeoutTmp = tl.getInput('timeout', false);
            if (timeoutTmp) {
                this.timeout = parseInt(timeoutTmp, 10);
            }

            this.publish = tl.getBoolInput('publish', false);
            this.deadLetterARN = tl.getInput('deadLetterARN', false);
            this.kmsKeyARN = tl.getInput('kmsKeyARN', false);
            this.environment = tl.getDelimitedInput('environment', '\n', false);
            this.tags = tl.getDelimitedInput('tags', '\n', false);
            this.securityGroups = tl.getDelimitedInput('securityGroups', '\n', false);
            this.subnets = tl.getDelimitedInput('subnets', '\n', false);
            this.tracingConfig = tl.getInput('tracingConfig', false);
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
