import tl = require("vsts-task-lib/task");
import path = require("path");
import fs = require("fs");
import Q = require("q");
import AWS = require("aws-sdk/clients/s3");
import TaskParameters = require("./helpers/taskParameters");
import S3ClientHelpers = require("./helpers/s3client");

tl.setResourcePath(path.join(__dirname, "task.json"));

function run(): Promise<void> {
    const taskParameters = new TaskParameters.AwsS3FileCopyTaskParameters();
    return S3ClientHelpers.AwsS3ClientHelpers.uploadArtifacts(taskParameters);
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, "")
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
    );
