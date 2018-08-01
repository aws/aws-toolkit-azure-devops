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

    // instance selector options
    public static readonly fromInstanceIds: string = 'fromInstanceIds';
    public static readonly fromTags: string = 'fromTags';
    public static readonly fromBuildVariable: string = 'fromBuildVariable';

    // task parameters
    public documentName: string;
    public documentParameters: string;
    public serviceRoleARN: string;
    public comment: string;
    public instanceSelector: string;
    public instanceIds: string[];
    public instanceTags: string[];
    public instanceBuildVariable: string;
    public maxConcurrency: string;
    public maxErrors: string;
    public timeout: string;
    public notificationArn: string;
    public notificationEvents: string;
    public notificationType: string;
    public outputS3BucketName: string;
    public outputS3KeyPrefix: string;
    public commandIdOutputVariable: string;

    constructor() {
        super();
        try {
            this.documentName = tl.getInput('documentName', true);
            this.documentParameters = tl.getInput('documentParameters', false);
            this.serviceRoleARN = tl.getInput('serviceRoleARN', false);
            this.comment = tl.getInput('comment', false);

            this.instanceSelector = tl.getInput('instanceSelector', true);
            switch (this.instanceSelector) {
                case TaskParameters.fromInstanceIds: {
                    this.instanceIds = tl.getDelimitedInput('instanceIds', '\n', true);
                }
                break;

                case TaskParameters.fromTags: {
                    this.instanceTags = tl.getDelimitedInput('instanceTags', '\n', true);
                }
                break;

                case TaskParameters.fromBuildVariable: {
                    this.instanceBuildVariable = tl.getInput('instanceBuildVariable', true);
                }
                break;

                default:
                    throw new Error(`Unknown value for instances selection: ${this.instanceSelector}`);
            }

            this.maxConcurrency = tl.getInput('maxConcurrency', false);
            this.maxErrors = tl.getInput('maxErrors', false);
            this.timeout = tl.getInput('timeout', false);

            this.notificationArn = tl.getInput('notificationArn', false);
            this.notificationEvents = tl.getInput('notificationEvents', false);
            this.notificationType = tl.getInput('notificationType', false);

            this.outputS3BucketName = tl.getInput('outputS3BucketName', false);
            this.outputS3KeyPrefix = tl.getInput('outputS3KeyPrefix', false);
            this.commandIdOutputVariable = tl.getInput('commandIdOutputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
