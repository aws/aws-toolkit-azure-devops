import tl = require('vsts-task-lib/task');
import path = require('path');
import AWS = require('aws-sdk/clients/codedeploy');
import TaskParameters = require('./helpers/taskParameters');
import TaskOperationHelpers = require('./helpers/taskOperations');

tl.setResourcePath(path.join(__dirname, 'task.json'));

function run(): Promise<void> {
    const taskParameters = new TaskParameters.DeployTaskParameters();
    return TaskOperationHelpers.TaskOperations.deploy(taskParameters);
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);
