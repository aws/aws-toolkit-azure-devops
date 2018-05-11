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

    public static readonly stringSecretType: string = 'string';
    public static readonly binarySecretType: string = 'binary';

    public static readonly inlineSecretSource: string = 'inline';
    public static readonly fileSecretSource: string = 'file';

    public static readonly maxVersionStages: number = 20;
    public static readonly maxTags: number = 50;

    public secretNameOrId: string;
    public description: string;
    public kmsKeyId: string;
    public secretValueType: string;
    public secretValueSource: string;
    public secretValue: string;
    public secretValueFile: string;
    public autoCreateSecret: boolean;
    public tags: string[];
    public arnOutputVariable: string;
    public versionIdOutputVariable: string;

    constructor() {
        super();
        try {
            this.secretNameOrId = tl.getInput('secretNameOrId', true);
            this.description = tl.getInput('description', false);
            this.secretValueType = tl.getInput('secretValueType', true);
            this.secretValueSource = tl.getInput('secretValueSource', true);

            if (this.secretValueSource === TaskParameters.inlineSecretSource) {
                this.secretValue = tl.getInput('secretValue', true);
            } else {
                this.secretValueFile = tl.getPathInput('secretValueFile', true, true);
            }

            this.kmsKeyId = tl.getInput('kmsKeyId', false);
            this.autoCreateSecret = tl.getBoolInput('autoCreateSecret', false);
            if (this.autoCreateSecret) {
                this.tags = tl.getDelimitedInput('tags', '\n', false);
                if (this.tags) {
                    const numTags = this.tags.length;
                    if (numTags > TaskParameters.maxTags) {
                        throw new Error(tl.loc('TooManyTags', numTags, TaskParameters.maxTags));
                    }
                }
            }
            this.arnOutputVariable = tl.getInput('arnOutputVariable', false);
            this.versionIdOutputVariable = tl.getInput('versionIdOutputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
