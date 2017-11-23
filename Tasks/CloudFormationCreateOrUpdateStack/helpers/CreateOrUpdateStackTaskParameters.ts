/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import fs = require('fs');
import sdkutils = require('sdkutils/sdkutils');

export class TaskParameters extends sdkutils.AWSTaskParametersBase {

    public readonly fileSource: string = 'file';
    public readonly urlSource: string = 'url';
    public readonly s3Source: string = 's3';

    public stackName: string;
    public templateSource: string;
    public templateFile: string;
    public s3BucketName: string;
    public s3ObjectKey: string;
    public templateUrl: string;
    public templateParametersFile: string;
    public useChangeSet: boolean;
    public changeSetName: string;
    public description: string;
    public autoExecuteChangeSet: boolean;
    public capabilityIAM: boolean;
    public capabilityNamedIAM: boolean;
    public roleARN: string;
    public notificationARNs: string[];
    public resourceTypes: string[];
    public tags: string[];

    public onFailure: string;
    public outputVariable: string;

    constructor() {
        super();
        try {
            this.stackName = tl.getInput('stackName', true);

            this.templateSource = tl.getInput('templateSource', true);
            switch (this.templateSource) {
                case this.fileSource: {
                    this.templateFile = tl.getPathInput('templateFile', true, true);
                    this.s3BucketName = tl.getInput('s3BucketName', false);
                }
                break;

                case this.urlSource: {
                    this.templateUrl = tl.getInput('templateUrl', true);
                }
                break;

                case this.s3Source: {
                    this.s3BucketName = tl.getInput('s3BucketName', true);
                    this.s3ObjectKey = tl.getInput('s3ObjectKey', true);
                }
                break;

                default:
                    throw new Error(`Unrecognized template source: ${this.templateSource}`);
            }

            // For currently unknown reason, if the user does not give a value then instead of an empty/null
            // path (per default value for the field), we get what appears to be the root of the repository
            // path. To solve this without needing to add a task parameter to indicate we should use a parameter
            // file (a breaking change) we do a simple directory vs file test
            this.templateParametersFile = tl.getPathInput('templateParametersFile', false, true);
            if (this.templateParametersFile) {
                if (fs.statSync(this.templateParametersFile).isDirectory()) {
                    this.templateParametersFile = null;
                }
            }

            this.useChangeSet = tl.getBoolInput('useChangeSet', false);
            this.changeSetName = tl.getInput('changeSetName', this.useChangeSet);
            this.description = tl.getInput('description', false);
            this.autoExecuteChangeSet = tl.getBoolInput('autoExecuteChangeSet', false);

            this.capabilityIAM = tl.getBoolInput('capabilityIAM', false);
            this.capabilityNamedIAM = tl.getBoolInput('capabilityNamedIAM', false);

            this.roleARN = tl.getInput('roleARN', false);
            this.tags = tl.getDelimitedInput('tags', '\n', false);
            this.notificationARNs = tl.getDelimitedInput('notificationARNs', '\n', false);
            this.resourceTypes = tl.getDelimitedInput('resourceTypes', '\n', false);

            this.onFailure = tl.getInput('onFailure');
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
