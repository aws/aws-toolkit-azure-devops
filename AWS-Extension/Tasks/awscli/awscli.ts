import tl = require("vsts-task-lib/task");
import path = require("path");
import Q = require("q");
import CliClientHelpers = require("./helpers/cliclient");
import TaskParameters = require("./helpers/taskParameters");

tl.setResourcePath(path.join(__dirname, "task.json"));

const taskParameters = new TaskParameters.AwsCliTaskParameters();

if (CliClientHelpers.AwsCliClientHelpers.checkIfAwsCliIsInstalled()) {
    CliClientHelpers.AwsCliClientHelpers.executeCommand(taskParameters);
}
