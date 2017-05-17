import tl = require("vsts-task-lib/task");
import tr = require('vsts-task-lib/toolrunner');
import awsCliParameters = require('./taskParameters')


export class CLIOperations {
    public static checkIfAwsCliIsInstalled() {
        try {
            return !!tl.which("aws", true);
        }
        catch (error) {
            tl.setResult(tl.TaskResult.Failed, tl.loc("AWSCLNotInstalled"));
        }
    }
    private static async configureAwsCli(taskParameters: awsCliParameters.awsCliParameters) {
        var awsCliPath = tl.which('aws');
        var awsCliTool: tr.ToolRunner = tl.tool(awsCliPath);
        awsCliTool.line('configure set aws_access_key_id');
        awsCliTool.arg(taskParameters.awsKeyId);
        await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
        tl.debug('configure secret access key');
        var awsCliTool: tr.ToolRunner = tl.tool(awsCliPath);
        awsCliTool.line('configure set aws_secret_access_key');
        awsCliTool.arg(taskParameters.awsSecretKey);
        await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
        tl.debug('configure region');
        var awsCliTool: tr.ToolRunner = tl.tool(awsCliPath);
        awsCliTool.line('configure set');
        awsCliTool.arg('default.region');
        awsCliTool.arg(taskParameters.awsRegion);
        await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
    }
    public static async executeCommand(taskParameters: awsCliParameters.awsCliParameters) {
        try {
            await this.configureAwsCli(taskParameters);
            var awsCliPath = tl.which('aws');
            var awsCliTool: tr.ToolRunner = tl.tool(awsCliPath);
            awsCliTool.arg(taskParameters.awsCliCommand);
            awsCliTool.arg(taskParameters.awsCliSubCommand);
            if (taskParameters.awsCliParameters != null) {
                awsCliTool.arg(taskParameters.awsCliParameters);
            }
            var code: number = await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
            tl.debug('return code: ' + code);
            if (code != 0) {
                tl.setResult(tl.TaskResult.Failed, tl.loc('AwsReturnCode', awsCliTool, code));
            }
            else {
                tl.setResult(tl.TaskResult.Succeeded, tl.loc('AwsReturnCode', awsCliTool, code));
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    }
}