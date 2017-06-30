import Q = require('q');
import proc = require('child_process');
import tl = require('vsts-task-lib/task');

export class DotNetCliWrapper {

    private cwd : string;
    private env : any;

    constructor(cwd : string, env : any) {
        this.cwd = cwd;
        this.env = env;
    }

    public restoreAsync() : Q.Promise<void> {
        return this.executeAsync(['restore']);
    }

    public serverlessDeployAsync(awsRegion: string, stackName: string, s3Bucket : string, s3Prefix: string) : Q.Promise<void>  {

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

        return this.executeAsync(args);
    }

    public lambdaDeployAsync(awsRegion: string, functionName: string, functionRole : string, functionMemory : number, functionTimeout : number) : Q.Promise<void>  {
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

        return this.executeAsync(args);
    }

    public executeAsync(args : string[]) : Q.Promise<void> {

        const deferred = Q.defer();
        const dotnetProcess = proc.spawn('dotnet', args,
        {
            cwd : this.cwd,
            env : this.env
        });

        dotnetProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });

        dotnetProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        dotnetProcess.on('exit', (code) => {
            if (code !== 0) {
                deferred.reject(new Error(tl.loc('', args.join(' '), code)));
            } else {
                deferred.resolve();
            }
        });

        return deferred.promise;
    }
}
