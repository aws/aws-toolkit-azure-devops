/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');

export class SendMessageTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public messageTarget: string;
    public message: string;
    public topicArn: string;
    public queueUrl: string;
    public delaySeconds: number;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.messageTarget = tl.getInput('messageTarget', true);
            this.message = tl.getInput('message', true);
            if (this.messageTarget === 'topic') {
                this.topicArn = tl.getInput('topicArn', true);
            } else {
                this.queueUrl = tl.getInput('queueUrl', true);
                const delay = tl.getInput('delaySeconds', false);
                if (delay) {
                    this.delaySeconds = parseInt(delay, 10);
                }
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
