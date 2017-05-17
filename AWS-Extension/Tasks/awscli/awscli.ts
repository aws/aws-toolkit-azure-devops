import tl = require("vsts-task-lib/task");
import path = require("path");
import Q = require('q');
import awsCliClient = require('./helpers/cliclient');
import awsCliParameters = require('./helpers/taskParameters')


tl.setResourcePath(path.join(__dirname, 'task.json'));

var taskParameters = new awsCliParameters.awsCliParameters();
if (awsCliClient.CLIOperations.checkIfAwsCliIsInstalled()) {
    awsCliClient.CLIOperations.executeCommand(taskParameters);
}