import Q = require('q');
import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import proc = require('child_process');
import awsLambdaClient = require('aws-sdk/clients/lambda');
import { DotNetCliWrapper } from './dotNetCliWrapper';
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async deployFunction(taskParameters: TaskParameters.AwsLambdaNETCoreDeployTaskParameters): Promise<void> {

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

        const env = process.env;
        env.AWS_ACCESS_KEY_ID = taskParameters.awsKeyId;
        env.AWS_SECRET_ACCESS_KEY = taskParameters.awsSecretKey;

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
                    taskParameters.functionTimeout);
                break;
            case 'deployServerless':
                console.log(tl.loc('StartingServerlessDeployment'));
                await wrapper.serverlessDeployAsync(
                    taskParameters.awsRegion,
                    taskParameters.stackName,
                    taskParameters.s3Bucket,
                    taskParameters.s3Prefix);
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
