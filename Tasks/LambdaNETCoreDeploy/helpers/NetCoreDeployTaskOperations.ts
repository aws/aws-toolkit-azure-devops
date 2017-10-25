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
import Parameters = require('./NetCoreDeployTaskParameters');

export class TaskOperations {

    public static async deployFunction(taskParameters: Parameters.TaskParameters): Promise<void> {

        // assume role credentials are not currently supported
        if (taskParameters.AssumeRoleARN) {
            throw new Error('Assume role-based temporary credentials are not currently supported for this task');
        }

        const cwd = this.determineProjectDirectory(taskParameters.lambdaProjectPath);
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

        // temp code until we adopt support for assume role credentials,
        // at which point we'll switch to using taskParameters.Credentials
        const awsEndpoint = tl.getInput('awsCredentials', true);
        const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);

        const env = process.env;
        env.AWS_ACCESS_KEY_ID = awsEndpointAuth.parameters.username;
        env.AWS_SECRET_ACCESS_KEY = awsEndpointAuth.parameters.password;

        const wrapper = new DotNetCliWrapper(cwd, env);

        console.log(tl.loc('StartingDotNetRestore'));
        await wrapper.restoreAsync();

        switch (taskParameters.command) {
            case 'deployFunction':
                console.log(tl.loc('StartingFunctionDeployment'));
                await wrapper.lambdaDeployAsync(
                    taskParameters.awsRegion,
                    taskParameters.functionName,
                    taskParameters.functionRole,
                    taskParameters.functionMemory,
                    taskParameters.functionTimeout,
                    taskParameters.additionalArgs);
                break;
            case 'deployServerless':
                console.log(tl.loc('StartingServerlessDeployment'));
                await wrapper.serverlessDeployAsync(
                    taskParameters.awsRegion,
                    taskParameters.stackName,
                    taskParameters.s3Bucket,
                    taskParameters.s3Prefix,
                    taskParameters.additionalArgs);
                break;

            default:
            throw new Error(tl.loc('UnknownCommandError', taskParameters.command));
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private static determineProjectDirectory(specifedLambdaProject : string) : string {

        if (path.extname(specifedLambdaProject) === '') {
            return specifedLambdaProject;
        }

        return path.dirname(specifedLambdaProject);
    }
}
