import tl = require("vsts-task-lib/task");
import path = require("path");
import fs = require("fs");
import Q = require('q');
import AWS = require('aws-sdk/clients/s3');
import awsS3Parameters = require("./helpers/deploymentParameters");
import awsS3Client = require("./helpers/s3client");

tl.setResourcePath(path.join(__dirname, 'task.json'));

function run(): Promise<void> {
    var taskParameters = new awsS3Parameters.S3Parameters();
    return awsS3Client.s3Client.uploadArtifacts(taskParameters);
};

//run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, "")
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
    );