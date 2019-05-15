/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase';

export class TaskParameters extends AWSTaskParametersBase {
    public messageTarget: string;
    public message: string;
    public topicArn: string;
    public queueUrl: string;
    public delaySeconds: number;

    constructor() {
        super();
        try {
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
