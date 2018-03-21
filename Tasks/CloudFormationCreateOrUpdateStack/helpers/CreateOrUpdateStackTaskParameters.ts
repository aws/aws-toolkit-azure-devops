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

    public readonly maxRollbackTriggers: number = 5;
    public readonly maxTriggerMonitoringTime: number = 180;

    public readonly loadTemplateParametersFromFile: string = 'file';
    public readonly loadTemplateParametersInline: string = 'inline';

    public stackName: string;
    public templateSource: string;
    public templateFile: string;
    public s3BucketName: string;
    public s3ObjectKey: string;
    public templateUrl: string;
    public templateParametersSource: string;
    public templateParametersFile: string;
    public templateParameters: string;
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
    public monitorRollbackTriggers: boolean;
    public monitoringTimeInMinutes: number = 0;
    public rollbackTriggerARNs: string[];

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

            this.templateParametersSource = tl.getInput('templateParametersSource', true);
            switch (this.templateParametersSource) {
                case this.loadTemplateParametersFromFile: {
                    // Value set optional for backwards compatibilty, to enable continued operation of
                    // tasks configured before 'inline' mode was added.
                    // Note that if the user does not give a value then instead of an empty/null
                    // path (per default value for the field), we get what appears to be the root
                    // of the repository path. To solve this without needing to add a task parameter
                    // to indicate we should use a parameter file (a breaking change) we do a simple
                    // directory vs file test
                    this.templateParametersFile = tl.getPathInput('templateParametersFile', false, true);
                    if (this.templateParametersFile) {
                        if (fs.statSync(this.templateParametersFile).isDirectory()) {
                            this.templateParametersFile = null;
                        }
                    }
                }
                break;

                case this.loadTemplateParametersInline: {
                    this.templateParameters = tl.getInput('templateParameters', true);
                }
                break;

                default:
                    throw new Error(`Unrecognized template parameters source: ${this.templateParametersSource}`);
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

            this.monitorRollbackTriggers = tl.getBoolInput('monitorRollbackTriggers', false);
            if (this.monitorRollbackTriggers) {
                const t = tl.getInput('monitoringTimeInMinutes', false);
                if (t) {
                    this.monitoringTimeInMinutes = parseInt(t, 10);
                    if (this.monitoringTimeInMinutes < 0 || this.monitoringTimeInMinutes > this.maxTriggerMonitoringTime) {
                        throw new Error(tl.loc('InvalidTriggerMonitoringTime', this.monitoringTimeInMinutes, this.maxTriggerMonitoringTime));
                    }
                }
                this.rollbackTriggerARNs = tl.getDelimitedInput('rollbackTriggerARNs', '\n', false);
                if (this.rollbackTriggerARNs && this.rollbackTriggerARNs.length > this.maxRollbackTriggers) {
                    throw new Error(tl.loc('ExceededMaxRollbackTriggers', this.rollbackTriggerARNs.length, this.maxRollbackTriggers));
                }
            }

            this.onFailure = tl.getInput('onFailure');
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
