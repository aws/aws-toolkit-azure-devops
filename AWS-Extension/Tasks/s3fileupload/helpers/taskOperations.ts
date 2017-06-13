import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import Q = require('q');
import awsS3Client = require('aws-sdk/clients/s3');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async uploadArtifacts(taskParameters: TaskParameters.AwsS3FileUploadTaskParameters): Promise<void> {
        const s3Config = {
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };

        const s3 = new awsS3Client(s3Config);
        if (taskParameters.creatBucket) {

            const params: awsS3Client.CreateBucketRequest = {
                Bucket: taskParameters.bucketName
            };
            s3.createBucket(params, function(err: AWSError, data: awsS3Client.CreateBucketOutput) {
                if (err) {
                    console.log(err);
                } else {
                    TaskOperations.uploadFiles(taskParameters, s3);
                }
            });
        } else {
            await TaskOperations.uploadFiles(taskParameters, s3);
        }
    }

    private static async uploadFiles(taskParameters: TaskParameters.AwsS3FileUploadTaskParameters, s3: awsS3Client) {
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
            targetPath = targetPath.replace(/\\/g, '/');
            const stats = fs.lstatSync(matchedFile);
            if (!stats.isDirectory()) {
                const fileBuffer = fs.readFileSync(matchedFile);
                tl.debug(`Upload file: ${matchedFile}`);
                s3.upload({
                    Bucket: taskParameters.bucketName,
                    Key: targetPath,
                    Body: fileBuffer,
                    ACL: taskParameters.filesAcl
                }, function(error: AWSError, response: awsS3Client.ManagedUpload) {
                    console.log(`Uploaded file ${matchedFile} to ${targetPath}`);
                    console.log(arguments);
                    if (error) {
                        tl.setResult(tl.TaskResult.Failed, tl.loc('...uploadfailed', error));
                    }
                });
            }
        }
    }

    private static findFiles(taskParameters: TaskParameters.AwsS3FileUploadTaskParameters): string[] {
        tl.debug('Searching for files to upload');
        console.log(`sourceFolderPath ${taskParameters.sourceFolder}`);
        taskParameters.sourceFolder = path.normalize(taskParameters.sourceFolder);
        const allPaths = tl.find(taskParameters.sourceFolder); // default find options (follow sym links)
        tl.debug(tl.loc('AllPaths', allPaths));
        const matchedPaths = tl.match(allPaths, taskParameters.globExpressions, taskParameters.sourceFolder); // default match options
        tl.debug(tl.loc('MatchedPaths', matchedPaths));
        const matchedFiles = matchedPaths.filter((itemPath) => !tl.stats(itemPath).isDirectory()); // filter-out directories
        tl.debug(tl.loc('MatchedFiles', matchedFiles));
        tl.debug(tl.loc('FoundNFiles', matchedFiles.length));
        return matchedFiles;
    }

}
