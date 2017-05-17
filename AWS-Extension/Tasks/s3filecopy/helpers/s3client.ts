import tl = require("vsts-task-lib/task");
import path = require("path");
import fs = require("fs");
import Q = require('q');
import awsS3 = require('aws-sdk/clients/s3');
import awsS3Parameters = require("./deploymentParameters");

export class s3Client {

    private static async uploadFiles(taskParameters, s3) {
        var matchedFiles = this.findFiles(taskParameters);
        for (var i = 0; i < matchedFiles.length; i++) {
            var matchedFile = matchedFiles[i];
            var relativePath = matchedFile.substring(taskParameters.sourceFolder.length);
            if (relativePath.startsWith(path.sep)) {
                relativePath = relativePath.substr(1);
            }
            var targetPath = relativePath;
           if (taskParameters.flattenFolders) {
                var flatFileName = path.basename(matchedFile);
                targetPath = path.join(taskParameters.targetFolder, flatFileName);
           }
            else {
                targetPath = path.join(taskParameters.targetFolder, relativePath);
            }
           var targetDir = path.dirname(targetPath);
            targetPath = targetPath.replace(/\\/g, '/');
            var stats = fs.lstatSync(matchedFile);
            if (!stats.isDirectory()) {
                var fileBuffer = fs.readFileSync(matchedFile);
                tl.debug("Upload file: " + matchedFile);
                s3.putObject({
                    Bucket: taskParameters.awsBucketName,
                    Key: targetPath,
                    Body: fileBuffer,
                    ACL: taskParameters.filesAcl
                }, function (error, response) {
                    console.log('uploaded file[' + matchedFile + '] to [' + targetPath + ']');
                    console.log(arguments);
                    if (error)
                        tl.setResult(tl.TaskResult.Failed, tl.loc('Uploadfailed', error));
                });
            }
        }
    }

    private static findFiles(taskParameters: awsS3Parameters.S3Parameters): string[] {
        tl.debug('Searching for files to upload');
        console.log('sourceFolderPath' + taskParameters.sourceFolder);
        taskParameters.sourceFolder = path.normalize(taskParameters.sourceFolder);
        var allPaths = tl.find(taskParameters.sourceFolder); // default find options (follow sym links)
        tl.debug(tl.loc('AllPaths', allPaths));
        var matchedPaths = tl.match(allPaths, taskParameters.awsContentPattern, taskParameters.sourceFolder); // default match options
        tl.debug(tl.loc('MatchedPaths', matchedPaths));
        var matchedFiles = matchedPaths.filter((itemPath) => !tl.stats(itemPath).isDirectory()); // filter-out directories
        tl.debug(tl.loc('MatchedFiles', matchedFiles));
        tl.debug(tl.loc('FoundNFiles', matchedFiles.length));
        return matchedFiles;
    }

    public static async uploadArtifacts(taskParameters: awsS3Parameters.S3Parameters): Promise<void> {
        var s3Config = {
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            params: {
                Bucket: taskParameters.awsBucketName
            },
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };
        var s3 = new awsS3(s3Config);
        if (taskParameters.creatBucket) {
            s3.createBucket(function (err, data) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Uploading file...");
                    s3Client.uploadFiles(taskParameters, s3);
                }
            });
        }
        else {
            await s3Client.uploadFiles(taskParameters, s3);
        }
    }
}
