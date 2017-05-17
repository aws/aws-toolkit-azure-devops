import tl = require("vsts-task-lib/task");
import path = require("path");
import fs = require("fs");
import Q = require('q');

import awsCloudFormation = require("./helpers/deploymentParameters");
import awsStackOperation = require("./helpers/stackOperations");

tl.setResourcePath(path.join(__dirname, 'task.json'))

function run(): Promise<void> {
    var taskParameters = new awsCloudFormation.CFDeploymentParameters();
    switch (taskParameters.action) {
        case "Create Stack":
            return awsStackOperation.CFStackOperations.createNewStack(taskParameters);
        case "Delete Stack":
            return awsStackOperation.CFStackOperations.deteleStack(taskParameters);
        default:
            throw tl.loc("InvalidAction", taskParameters.action);
    }
};

//run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, "")
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
    );