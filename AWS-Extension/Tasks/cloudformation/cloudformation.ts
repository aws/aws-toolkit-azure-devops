import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import Q = require('q');

import TaskParameters = require('./helpers/taskParameters');
import TaskOperationHelpers = require('./helpers/taskOperations');

tl.setResourcePath(path.join(__dirname, 'task.json'));

function run(): Promise<void> {
    const taskParameters = new TaskParameters.CloudFormationTaskParameters();
    switch (taskParameters.action) {
        case 'Create Stack':
            return TaskOperationHelpers.TaskOperations.createNewStack(taskParameters);
        case 'Delete Stack':
            return TaskOperationHelpers.TaskOperations.deleteStack(taskParameters);
        default:
            throw tl.loc('InvalidAction', taskParameters.action);
    }
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);
