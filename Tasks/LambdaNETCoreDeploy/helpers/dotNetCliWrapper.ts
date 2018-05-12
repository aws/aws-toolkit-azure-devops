/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import proc = require('child_process');
import tl = require('vsts-task-lib/task');
import tr = require('vsts-task-lib/toolrunner');

export class DotNetCliWrapper {

    private cwd : string;
    private env : any;

    constructor(cwd : string, env : any) {
        this.cwd = cwd;
        this.env = env;
    }

    public restoreAsync() : Promise<void> {
        return this.executeAsync(['restore'], null);
    }

    public serverlessDeployAsync(awsRegion: string, stackName: string, s3Bucket : string, s3Prefix: string, additionalArgs : string) : Promise<void>  {

        const args = Array<string>();

        args.push('lambda');
        args.push('deploy-serverless');

        args.push('--disable-interactive');
        args.push('true');

        if (awsRegion) {
            args.push('--region');
            args.push(awsRegion);
        }
        if (stackName) {
            args.push('--stack-name');
            args.push(stackName);
        }
        if (s3Bucket) {
            args.push('--s3-bucket');
            args.push(s3Bucket);
        }
        if (s3Prefix) {
            args.push('--s3-prefix');
            args.push(s3Prefix);
        }

        return this.executeAsync(args, additionalArgs);
    }

    public lambdaDeployAsync(awsRegion: string,
                             functionName: string,
                             functionHandler: string,
                             functionRole : string,
                             functionMemory : number,
                             functionTimeout : number,
                             additionalArgs : string) : Promise<void>  {
        const args = Array<string>();

        args.push('lambda');
        args.push('deploy-function');

        args.push('--disable-interactive');
        args.push('true');

        if (awsRegion) {
            args.push('--region');
            args.push(awsRegion);
        }
        if (functionName) {
            args.push('-fn');
            args.push(functionName);
        }
        if (functionHandler) {
            args.push('-fh');
            args.push(functionHandler);
        }
        if (functionRole) {
            args.push('--function-role');
            args.push(functionRole);
        }
        if (functionMemory) {
            args.push('--function-memory-size');
            args.push(functionMemory.toString());
        }
        if (functionTimeout) {
            args.push('--function-timeout');
            args.push(functionTimeout.toString());
        }

        return this.executeAsync(args, additionalArgs);
    }

    public async executeAsync(args : string[], additionalArgs : string) : Promise<void> {

        const dotnetPath = tl.which('dotnet', true);
        console.log('Path to tool: ' + dotnetPath);

        const dotnet = tl.tool(dotnetPath);

        for (const arg of args) {
            dotnet.arg(arg);
        }

        dotnet.line(additionalArgs);

        const execOptions = <tr.IExecOptions> {
            cwd : this.cwd,
            env : this.env
        };

        await dotnet.exec(execOptions);
    }
}
