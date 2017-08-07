/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');

export class CreateOrUpdateStackTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public stackName: string;
    public templateFile: string;
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

    public onFailure: string;
    public outputVariable: string;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.stackName = tl.getInput('stackName', true);

            this.templateFile = tl.getPathInput('templateFile', true, true);
            this.templateParametersFile = tl.getPathInput('templateParametersFile', false, true);

            this.useChangeSet = tl.getBoolInput('useChangeSet', false);
            this.changeSetName = tl.getInput('changeSetName', this.useChangeSet);
            this.description = tl.getInput('description', false);
            this.autoExecuteChangeSet = tl.getBoolInput('autoExecuteChangeSet', false);

            this.capabilityIAM = tl.getBoolInput('capabilityIAM', false);
            this.capabilityNamedIAM = tl.getBoolInput('capabilityNamedIAM', false);

            this.roleARN = tl.getInput('roleARN', false);
            this.notificationARNs = tl.getDelimitedInput('notificationARNs', '\n', false);
            this.resourceTypes = tl.getDelimitedInput('resourceTypes', '\n', false);

            this.onFailure = tl.getInput('onFailure');
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
