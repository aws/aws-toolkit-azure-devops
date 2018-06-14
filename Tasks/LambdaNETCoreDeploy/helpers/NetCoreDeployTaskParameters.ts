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

    // option values for the 'deploymentType' property
    public static readonly deployFunction: string = 'deployFunction';
    public static readonly deployServerless: string = 'deployServerless';

    public command: string;
    public packageOnly: boolean;

    public lambdaProjectPath: string;

    // Used in package-only mode, contains either the filename and path of the
    // output package for a Lambda function, or the template output path when
    // packaging a serverless app
    public packageOutputFile: string;

    public functionHandler: string;
    public functionName: string;
    public functionRole: string;
    public functionMemory: number;
    public functionTimeout: number;

    public stackName: string;
    public s3Bucket: string;
    public s3Prefix: string;

    public additionalArgs: string;

    constructor() {
        super();
        try {
            this.command = tl.getInput('command', true);
            this.packageOnly = tl.getBoolInput('packageOnly', true);

            this.lambdaProjectPath = tl.getPathInput('lambdaProjectPath', true, true);

            if (this.packageOnly) {
                this.packageOutputFile = tl.getPathInput('packageOutputFile', true, false);
            }

            this.functionName = tl.getInput('functionName', false);
            this.functionRole = tl.getInput('functionRole', false);
            this.functionHandler = tl.getInput('functionHandler', false);

            if(tl.getInput('functionMemory', false)) {
                this.functionMemory = parseInt(tl.getInput('functionMemory', false), 10);
            }
            if(tl.getInput('functionTimeout', false)) {
                this.functionTimeout = parseInt(tl.getInput('functionTimeout', false), 10);
            }

            this.stackName = tl.getInput('stackName', false);
            this.s3Bucket = tl.getInput('s3Bucket', false);
            this.s3Prefix = tl.getInput('s3Prefix', false);

            this.additionalArgs = tl.getInput('additionalArgs', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
