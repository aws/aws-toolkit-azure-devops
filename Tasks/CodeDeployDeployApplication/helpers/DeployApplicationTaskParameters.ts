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
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public applicationName: string;
    public deploymentGroupName: string;
    public revisionBundle: string;
    public bucketName: string;
    public bundlePrefix: string;
    public description: string;
    public fileExistsBehavior: string;
    public updateOutdatedInstancesOnly: boolean;
    public ignoreApplicationStopFailures: boolean;
    public outputVariable: string;

    constructor() {
        super();
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.applicationName = tl.getInput('applicationName', true);
            this.deploymentGroupName = tl.getInput('deploymentGroupName', true);
            this.revisionBundle = tl.getPathInput('revisionBundle', true, true);
            this.bucketName = tl.getInput('bucketName', true);
            this.bundlePrefix = tl.getInput('bundlePrefix', false);
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
