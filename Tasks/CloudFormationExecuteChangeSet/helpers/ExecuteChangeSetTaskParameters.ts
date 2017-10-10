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
    public changeSetName: string;
    public stackName: string;
    public outputVariable: string;

    constructor() {
        super();
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);

            this.changeSetName = tl.getInput('changeSetName', true);
            this.stackName = tl.getInput('stackName', true);
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
