/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import { parse, format, Url } from 'url';
import tl = require('vsts-task-lib/task');
import tr = require('vsts-task-lib/toolrunner');
import Parameters = require('./AWSCliTaskParameters');

export class TaskOperations {

    public constructor(
        public readonly taskParameters: Parameters.TaskParameters
    ) {
    }

    public static checkIfAwsCliIsInstalled() {
        try {
            return !!tl.which('aws', true);
        } catch (error) {
            tl.setResult(tl.TaskResult.Failed, tl.loc('AWSCLINotInstalled'));
        }
    }

    public async execute() {
        try {
            await this.configureAwsCli();
            await this.taskParameters.configureHttpProxyFromAgentProxyConfiguration('AWSCLI');

            const awsCliPath = tl.which('aws');
            const awsCliTool: tr.ToolRunner = tl.tool(awsCliPath);
            awsCliTool.arg(this.taskParameters.awsCliCommand);
            awsCliTool.arg(this.taskParameters.awsCliSubCommand);
            if (this.taskParameters.awsCliParameters != null) {
                awsCliTool.line(this.taskParameters.awsCliParameters);
            }
            const code: number = await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: this.taskParameters.failOnStandardError });
            tl.debug(`return code: ${code}`);
            if (code !== 0) {
                tl.setResult(tl.TaskResult.Failed, tl.loc('AwsReturnCode', awsCliTool, code));
            } else {
                tl.setResult(tl.TaskResult.Succeeded, tl.loc('AwsReturnCode', awsCliTool, code));
            }
        } catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    }

    private async configureAwsCli() {
        // if assume role credentials are in play, make sure the initial generation
        // of temporary credentials has been performed
        await this.taskParameters.Credentials.getPromise().then(() => {
            // push credentials and region into environment variables rather than a
            // stored profile, as this isolates parallel builds and avoids content left
            // lying around on the agent when a build completes
            const env = process.env;

            tl.debug('configure credentials into environment variables');
            env.AWS_ACCESS_KEY_ID = this.taskParameters.Credentials.accessKeyId;
            env.AWS_SECRET_ACCESS_KEY = this.taskParameters.Credentials.secretAccessKey;
            if (this.taskParameters.Credentials.sessionToken) {
                env.AWS_SESSION_TOKEN = this.taskParameters.Credentials.sessionToken;
            }

            tl.debug('configure region into environment variable');
            env.AWS_DEFAULT_REGION = this.taskParameters.awsRegion;
        });
    }
}
