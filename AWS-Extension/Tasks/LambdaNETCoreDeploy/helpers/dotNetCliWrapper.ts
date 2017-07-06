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

        args.push('--enable-interactive');
        args.push('false');

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

    public lambdaDeployAsync(awsRegion: string, functionName: string, functionRole : string, functionMemory : number, functionTimeout : number, additionalArgs : string) : Promise<void>  {
        const args = Array<string>();

        args.push('lambda');
        args.push('deploy-function');

        args.push('--enable-interactive');
        args.push('false');

        if (awsRegion) {
            args.push('--region');
            args.push(awsRegion);
        }
        if (functionName) {
            args.push('-fn');
            args.push(functionName);
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

        var dotnetPath = tl.which('dotnet', true);
        console.log('Path to tool: ' + dotnetPath);

        var dotnet = tl.tool(dotnetPath);

        for(let arg of args) {
            dotnet.arg(arg);
        }

        dotnet.line(additionalArgs);

        var execOptions = <tr.IExecOptions>{
            cwd : this.cwd,
            env : this.env
        }
        
        return await dotnet.exec(execOptions);
    }
}
