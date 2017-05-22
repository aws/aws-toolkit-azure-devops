import tl = require("vsts-task-lib/task");
import path = require("path");
import fs = require("fs");
import Q = require("q");

import TaskParameters = require("./helpers/taskParameters");
import StackOperationHelpers = require("./helpers/stackOperations");

tl.setResourcePath(path.join(__dirname, "task.json"));

function run(): Promise<void> {
    const taskParameters = new TaskParameters.AwsCloudFormationTaskParameters();
    switch (taskParameters.action) {
        case "Create Stack":
            return StackOperationHelpers.AwsStackOperationHelpers.createNewStack(taskParameters);
        case "Delete Stack":
            return StackOperationHelpers.AwsStackOperationHelpers.deleteStack(taskParameters);
        default:
            throw tl.loc("InvalidAction", taskParameters.action);
    }
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, "")
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);
