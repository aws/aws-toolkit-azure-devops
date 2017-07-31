import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsGlobal = require('aws-sdk/global');
import awsS3Client = require('aws-sdk/clients/s3');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async uploadArtifacts(taskParameters: TaskParameters.UploadTaskParameters): Promise<void> {
        this.s3Client = this.createServiceClients(taskParameters);

        if (taskParameters.createBucket) {
            await this.createBucketIfNotExist(taskParameters.bucketName, taskParameters.awsRegion);
        } else {
            const exists = await this.testBucketExists(taskParameters.bucketName);
            if (!exists) {
                throw new Error(tl.loc('BucketNotExistNoAutocreate', taskParameters.bucketName));
            }
        }

        await this.uploadFiles(taskParameters);
        console.log(tl.loc('TaskCompleted'));
    }

    private static s3Client: awsS3Client;

    private static createServiceClients(taskParameters: TaskParameters.UploadTaskParameters): awsS3Client {

        return new awsS3Client({
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        });
    }

    private static async createBucketIfNotExist(bucketName: string, region: string) : Promise<void> {
        const exists = await this.testBucketExists(bucketName);
        if (exists) {
            return;
        }

        try {
            console.log(tl.loc('BucketNotExistCreating', bucketName, region));
            await this.s3Client.createBucket({ Bucket: bucketName }).promise();
            console.log(tl.loc('BucketCreated'));
        } catch (err) {
            console.log(tl.loc('CreateBucketFailure'), err);
            throw err;
        }
    }

    private static async testBucketExists(bucketName: string): Promise<boolean> {
        try {
            await this.s3Client.headBucket({ Bucket: bucketName}).promise();
            return true;
        } catch (err) {
            return false;
        }
    }

    private static async uploadFiles(taskParameters: TaskParameters.UploadTaskParameters) {

        let msgTarget: string;
        if (taskParameters.targetFolder) {
            msgTarget = taskParameters.targetFolder;
        } else {
            msgTarget = '/';
        }
        console.log(tl.loc('UploadingFiles', taskParameters.sourceFolder, msgTarget, taskParameters.bucketName));

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
                if (taskParameters.targetFolder) {
                    targetPath = path.join(taskParameters.targetFolder, flatFileName);
                } else {
                    targetPath = flatFileName;
                }
            } else {
                if (taskParameters.targetFolder) {
                    targetPath = path.join(taskParameters.targetFolder, relativePath);
                } else {
                    targetPath = relativePath;
                }
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
        const matchedPaths = tl.match(allPaths, taskParameters.globExpressions); // default match options
        tl.debug(tl.loc('MatchedPaths', matchedPaths));
        const matchedFiles = matchedPaths.filter((itemPath) => !tl.stats(itemPath).isDirectory()); // filter-out directories
        tl.debug(tl.loc('MatchedFiles', matchedFiles));
        tl.debug(tl.loc('FoundNFiles', matchedFiles.length));
        return matchedFiles;
    }

}
