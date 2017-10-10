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
    public bucketName: string;
    public sourceFolder: string;
    public targetFolder: string;
    public globExpressions: string[];
    public overwrite: boolean;
    public forcePathStyleAddressing: boolean;

    constructor() {
        super();
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.bucketName = tl.getInput('bucketName', true);
            this.sourceFolder = tl.getPathInput('sourceFolder', false, false);
            this.targetFolder = tl.getPathInput('targetFolder', true, false);
            this.globExpressions = tl.getDelimitedInput('globExpressions', '\n', true);
            this.overwrite = tl.getBoolInput('overwrite', false);
            this.forcePathStyleAddressing = tl.getBoolInput('forcePathStyleAddressing', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
