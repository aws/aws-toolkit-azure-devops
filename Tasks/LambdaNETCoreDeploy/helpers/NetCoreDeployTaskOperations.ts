/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import proc = require('child_process');
import { DotNetCliWrapper } from './dotNetCliWrapper';
import { TaskParameters } from './NetCoreDeployTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {

        const cwd = this.determineProjectDirectory(this.taskParameters.lambdaProjectPath);
        console.log(tl.loc('DeployingProjectAt', cwd));

        const defaultsFilePath: string = path.join(cwd, 'aws-lambda-tools-defaults.json');

        if (fs.existsSync(defaultsFilePath)) {
            console.log(tl.loc('ReadingDefaultSettingsFile'));
            let content = fs.readFileSync(defaultsFilePath, 'utf8');
            const json = JSON.parse(content);
            if (json.profile) {
                console.log(tl.loc('ClearingProfileCredentials', json.profile));
                json.profile = '';
                content = JSON.stringify(json);
                fs.writeFileSync(defaultsFilePath, content);
            }
        }

        const env = process.env;
        // if assume role credentials are in play, make sure the initial generation
        // of temporary credentials has been performed
        await this.taskParameters.Credentials.getPromise().then(() => {
            env.AWS_ACCESS_KEY_ID = this.taskParameters.Credentials.accessKeyId;
            env.AWS_SECRET_ACCESS_KEY = this.taskParameters.Credentials.secretAccessKey;
            if (this.taskParameters.Credentials.sessionToken) {
                env.AWS_SESSION_TOKEN = this.taskParameters.Credentials.sessionToken;
            }
        });

        await this.taskParameters.configureHttpProxyFromAgentProxyConfiguration('LambdaNETCoreDeploy');

        const wrapper = new DotNetCliWrapper(cwd, env);

        console.log(tl.loc('StartingDotNetRestore'));
        await wrapper.restoreAsync();

        switch (this.taskParameters.command) {
            case 'deployFunction':
                console.log(tl.loc('StartingFunctionDeployment'));
                await wrapper.lambdaDeployAsync(
                    this.taskParameters.awsRegion,
                    this.taskParameters.functionName,
                    this.taskParameters.functionHandler,
                    this.taskParameters.functionRole,
                    this.taskParameters.functionMemory,
                    this.taskParameters.functionTimeout,
                    this.taskParameters.additionalArgs);
                break;
            case 'deployServerless':
                console.log(tl.loc('StartingServerlessDeployment'));
                await wrapper.serverlessDeployAsync(
                    this.taskParameters.awsRegion,
                    this.taskParameters.stackName,
                    this.taskParameters.s3Bucket,
                    this.taskParameters.s3Prefix,
                    this.taskParameters.additionalArgs);
                break;

            default:
            throw new Error(tl.loc('UnknownCommandError', this.taskParameters.command));
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private determineProjectDirectory(specifedLambdaProject : string) : string {

        // should have already verified existence when reading parameters, but defense in
        // depth
        if (!fs.existsSync(specifedLambdaProject)) {
            throw new Error(tl.loc('ProjectPathOrFileDoesNotExist', specifedLambdaProject));
        }

        if (fs.statSync(specifedLambdaProject).isDirectory()) {
            return specifedLambdaProject;
        }

        return path.dirname(specifedLambdaProject);
    }
}
