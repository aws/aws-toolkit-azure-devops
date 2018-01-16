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

    // deploymentRevisionSource options
    public readonly revisionSourceFromWorkspace: string = 'workspace';
    public readonly revisionSourceFromS3: string = 's3';

    public applicationName: string;
    public deploymentGroupName: string;
    public deploymentRevisionSource: string;
    public revisionBundle: string;
    public bucketName: string;
    public bundlePrefix: string;
    public bundleKey: string;
    public description: string;
    public fileExistsBehavior: string;
    public updateOutdatedInstancesOnly: boolean;
    public ignoreApplicationStopFailures: boolean;
    public outputVariable: string;

    constructor() {
        super();
        try {
            this.applicationName = tl.getInput('applicationName', true);
            this.deploymentGroupName = tl.getInput('deploymentGroupName', true);
            this.deploymentRevisionSource = tl.getInput('deploymentRevisionSource', true);
            switch (this.deploymentRevisionSource) {
                case this.revisionSourceFromWorkspace: {
                    this.revisionBundle = tl.getPathInput('revisionBundle', true, true);
                    this.bundlePrefix = tl.getInput('bundlePrefix', false);
                }
                break;

                case this.revisionSourceFromS3: {
                    this.bundleKey = tl.getInput('bundleKey', true);
                }
                break;
            }
            this.bucketName = tl.getInput('bucketName', true);
            this.description = tl.getInput('description', false);
            this.fileExistsBehavior = tl.getInput('fileExistsBehavior', false);
            this.updateOutdatedInstancesOnly = tl.getBoolInput('updateOutdatedInstancesOnly', false);
            this.ignoreApplicationStopFailures = tl.getBoolInput('ignoreApplicationStopFailures', false);
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
