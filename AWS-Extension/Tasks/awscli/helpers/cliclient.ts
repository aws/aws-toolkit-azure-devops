import tl = require("vsts-task-lib/task");
import tr = require("vsts-task-lib/toolrunner");
import TaskParameters = require("./taskParameters");

export class AwsCliClientHelpers {
    public static checkIfAwsCliIsInstalled() {
        try {
            return !!tl.which("aws", true);
        } catch (error) {
            tl.setResult(tl.TaskResult.Failed, tl.loc("AWSCLINotInstalled"));
        }
    }

    public static async executeCommand(taskParameters: TaskParameters.AwsCliTaskParameters) {
        try {
            await this.configureAwsCli(taskParameters);
            const awsCliPath = tl.which("aws");
            const awsCliTool: tr.ToolRunner = tl.tool(awsCliPath);
            awsCliTool.arg(taskParameters.awsCliCommand);
            awsCliTool.arg(taskParameters.awsCliSubCommand);
            if (taskParameters.awsCliParameters != null) {
                awsCliTool.arg(taskParameters.awsCliParameters);
            }
            const code: number = await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
            tl.debug("return code: " + code);
            if (code !== 0) {
                tl.setResult(tl.TaskResult.Failed, tl.loc("AwsReturnCode", awsCliTool, code));
            } else {
                tl.setResult(tl.TaskResult.Succeeded, tl.loc("AwsReturnCode", awsCliTool, code));
            }
        } catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    }

    private static async configureAwsCli(taskParameters: TaskParameters.AwsCliTaskParameters) {
        const awsCliPath = tl.which("aws");
        const awsCliTool: tr.ToolRunner = tl.tool(awsCliPath);
        awsCliTool.line("configure set aws_access_key_id");
        awsCliTool.arg(taskParameters.awsKeyId);
        await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
        tl.debug("configure secret access key");
        awsCliTool.line("configure set aws_secret_access_key");
        awsCliTool.arg(taskParameters.awsSecretKey);
        await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
        tl.debug("configure region");
        awsCliTool.line("configure set");
        awsCliTool.arg("default.region");
        awsCliTool.arg(taskParameters.awsRegion);
        await awsCliTool.exec(<tr.IExecOptions>{ failOnStdErr: taskParameters.failOnStandardError });
    }
}
