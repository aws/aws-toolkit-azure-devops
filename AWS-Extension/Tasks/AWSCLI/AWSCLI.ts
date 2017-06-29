import tl = require('vsts-task-lib/task');
import path = require('path');
import Q = require('q');
import TaskOperationHelpers = require('./helpers/taskOperations');
import TaskParameters = require('./helpers/taskParameters');

tl.setResourcePath(path.join(__dirname, 'task.json'));

const taskParameters = new TaskParameters.CliTaskParameters();

if (TaskOperationHelpers.TaskOperations.checkIfAwsCliIsInstalled()) {
    TaskOperationHelpers.TaskOperations.executeCommand(taskParameters);
}
