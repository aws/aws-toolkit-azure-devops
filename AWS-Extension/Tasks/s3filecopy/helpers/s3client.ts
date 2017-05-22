import tl = require("vsts-task-lib/task");
import path = require("path");
import fs = require("fs");
import Q = require("q");
import awsS3Client = require("aws-sdk/clients/s3");
import TaskParameters = require("./taskParameters");

export class AwsS3ClientHelpers {

    private static async uploadFiles(taskParameters: TaskParameters.AwsS3FileCopyTaskParameters, s3: awsS3Client) {
        const matchedFiles = this.findFiles(taskParameters);
        for (let i = 0; i < matchedFiles.length; i++) {
            const matchedFile = matchedFiles[i];
            let relativePath = matchedFile.substring(taskParameters.sourceFolder.length);
            if (relativePath.startsWith(path.sep)) {
                relativePath = relativePath.substr(1);
            }
            let targetPath = relativePath;
            if (taskParameters.flattenFolders) {
                const flatFileName = path.basename(matchedFile);
                targetPath = path.join(taskParameters.targetFolder, flatFileName);
            } else {
                targetPath = path.join(taskParameters.targetFolder, relativePath);
            }
            const targetDir = path.dirname(targetPath);
            targetPath = targetPath.replace(/\\/g, "/");
            const stats = fs.lstatSync(matchedFile);
            if (!stats.isDirectory()) {
                const fileBuffer = fs.readFileSync(matchedFile);
                tl.debug("Upload file: " + matchedFile);
                s3.putObject({
                    Bucket: taskParameters.awsBucketName,
                    Key: targetPath,
                    Body: fileBuffer,
                    ACL: taskParameters.filesAcl
                }, function(error, response) {
                    console.log("uploaded file[" + matchedFile + "] to [" + targetPath + "]");
                    console.log(arguments);
                    if (error) {
                        tl.setResult(tl.TaskResult.Failed, tl.loc("Uploadfailed", error));
                    }
                });
            }
        }
    }

    private static findFiles(taskParameters: TaskParameters.AwsS3FileCopyTaskParameters): string[] {
        tl.debug("Searching for files to upload");
        console.log("sourceFolderPath" + taskParameters.sourceFolder);
        taskParameters.sourceFolder = path.normalize(taskParameters.sourceFolder);
        const allPaths = tl.find(taskParameters.sourceFolder); // default find options (follow sym links)
        tl.debug(tl.loc("AllPaths", allPaths));
        const matchedPaths = tl.match(allPaths, taskParameters.awsContentPattern, taskParameters.sourceFolder); // default match options
        tl.debug(tl.loc("MatchedPaths", matchedPaths));
        const matchedFiles = matchedPaths.filter((itemPath) => !tl.stats(itemPath).isDirectory()); // filter-out directories
        tl.debug(tl.loc("MatchedFiles", matchedFiles));
        tl.debug(tl.loc("FoundNFiles", matchedFiles.length));
        return matchedFiles;
    }

    public static async uploadArtifacts(taskParameters: TaskParameters.AwsS3FileCopyTaskParameters): Promise<void> {
        const s3Config = {
            apiVersion: "2006-03-01",
            region: taskParameters.awsRegion,
            params: {
                Bucket: taskParameters.awsBucketName
            },
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };

        const s3 = new awsS3Client(s3Config);
        if (taskParameters.creatBucket) {
            s3.createBucket(function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Uploading file...");
                    AwsS3ClientHelpers.uploadFiles(taskParameters, s3);
                }
            });
        } else {
            await AwsS3ClientHelpers.uploadFiles(taskParameters, s3);
        }
    }
}
