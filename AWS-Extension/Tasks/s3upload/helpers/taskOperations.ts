import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import Q = require('q');
import awsS3Client = require('aws-sdk/clients/s3');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async uploadArtifacts(taskParameters: TaskParameters.UploadTaskParameters): Promise<void> {
        this.createServiceClient(taskParameters);

        if (taskParameters.createBucket) {
            await this.createBucketIfNotExist(taskParameters);
        }

        await this.uploadFiles(taskParameters);
    }

    private static s3Client: awsS3Client;

    private static createServiceClient(taskParameters: TaskParameters.UploadTaskParameters) {
        const s3Config = {
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };

        this.s3Client = new awsS3Client(s3Config);
    }

    private static async createBucketIfNotExist(taskParameters: TaskParameters.UploadTaskParameters) : Promise<void> {
        if (!taskParameters.createBucket) {
            return Promise.resolve();
        }

        try {
            // does bucket exist and do we have permissions to access it?
            await this.s3Client.headBucket({ Bucket: taskParameters.bucketName}).promise();
        } catch (err) {
            // no, or we don't have access, so try and create it
            tl.debug(tl.loc('HeadBucketFailed', taskParameters.bucketName));
            try {
                const response: awsS3Client.CreateBucketOutput = await this.s3Client.createBucket({ Bucket: taskParameters.bucketName }).promise();
            } catch (err) {
                console.log(tl.loc('CreateBucketFailure'), err);
                throw err;
            }
        }
    }

    private static async uploadFiles(taskParameters: TaskParameters.UploadTaskParameters) {
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
                const fileBuffer = fs.createReadStream(matchedFile);
                console.log(tl.loc('UploadingFile', matchedFile));
                try {
                    const response: awsS3Client.ManagedUpload.SendData = await this.s3Client.upload({
                        Bucket: taskParameters.bucketName,
                        Key: targetPath,
                        Body: fileBuffer,
                        ACL: taskParameters.filesAcl
                    }).promise();
                    console.log(tl.loc('FileUploadCompleted', matchedFile, targetPath));
                } catch (err) {
                    console.error(tl.loc('FileUploadFailed'), err);
                    throw err;
                }
            }
        }
    }

    private static findFiles(taskParameters: TaskParameters.UploadTaskParameters): string[] {
        console.log(`Searching ${taskParameters.sourceFolder} for files to upload`);
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
