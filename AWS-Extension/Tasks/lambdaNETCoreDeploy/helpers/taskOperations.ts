import Q = require("q");
import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import proc = require('child_process');
import awsLambdaClient = require('aws-sdk/clients/lambda');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async deployFunction(taskParameters: TaskParameters.AwsLambdaNETCoreDeployTaskParameters): Promise<void> {

        // var options = new any();
        // options.stdio = 'pipe';
        // options.stderr = 'pipe';
        // options.encoding = 'utf-8'

        // var content = process.spawnSync('dotnet', 
        // [
        //     'lambda',
        //     'help'
        // ],
        // options)

        // console.log(content);

        var cwd = this.determineProjectDirectory(taskParameters.lambdaProjectPath);
        console.log("Path to Lambda project: " + cwd);

        var defaultsFilePath = path.join(cwd, "aws-lambda-tools-defaults.json");

        if(fs.existsSync(defaultsFilePath)) {
            console.log("Reading existing aws-lambda-tools-defaults.json")
            var content = fs.readFileSync(defaultsFilePath, 'utf8');
            var json = JSON.parse(content);
            if(json["profile"]) {

                console.log("Clearing out profile \"" + json["profile"] + "\" so task credentials will be used.")
                json["profile"] = "";
                var content = JSON.stringify(json);
                fs.writeFileSync(defaultsFilePath, content);
            }
        }
        
        var env = process.env;
        env["AWS_ACCESS_KEY_ID"] = taskParameters.awsKeyId;
        env["AWS_SECRET_ACCESS_KEY"] = taskParameters.awsSecretKey;

        var wrapper = new DotNetCliWrapper(cwd, env);

        console.log("Begin dotnet restore");
        await wrapper.restoreAsync();

        console.log("Begin Lambda Deployment");
        await wrapper.lambdaDeployAsync(taskParameters.awsRegion, taskParameters.functionName, taskParameters.functionRole);
    }

    private static determineProjectDirectory(specifedLambdaProject : string) : string {

        if(path.extname(specifedLambdaProject) == "") {
            return specifedLambdaProject;
        }

        return path.dirname(specifedLambdaProject);
    }
}

class DotNetCliWrapper {

    private _cwd : string;
    private _env : any;

    constructor(cwd : string, env : any) {
        this._cwd = cwd;
        this._env = env;
    }

    public restoreAsync() : Q.Promise<void> {
        return this.executeAsync(["restore"]);
    }

    public lambdaDeployAsync(awsRegion: string, functionName: string, functionRole : string) : Q.Promise<void>  {
        var args = Array<string>();

        args.push("lambda");
        args.push("deploy-function");
       
        if(awsRegion) {
            args.push("--region");
            args.push(awsRegion);
        }
        if(functionName) {
            args.push("-fn");
            args.push(functionName);
        }
        if(functionRole) {
            args.push("-frole");
            args.push(functionRole);
        }

        return this.executeAsync(args);
    }


    public executeAsync(args : string[]) : Q.Promise<void> {

        var deferred = Q.defer();
        var dotnetProcess = proc.spawn('dotnet', args, 
        {
            cwd : this._cwd,
            env : this._env
        });

		dotnetProcess.stdout.on('data', (data) => {
            console.log(data.toString());
        });        

		dotnetProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });        

        dotnetProcess.on("exit", (code) => {
            if (code !== 0) {
                deferred.reject(new Error("dotnet " + args.join(" ") + " exited with code " + code));
            } 
            else {
                deferred.resolve();
            }
        });

        return deferred.promise; 
    }
}

