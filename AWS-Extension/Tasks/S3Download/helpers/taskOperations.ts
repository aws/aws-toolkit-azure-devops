import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import mm = require('minimatch');
import Q = require('q');

import awsS3Client = require('aws-sdk/clients/s3');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async downloadArtifacts(taskParameters: TaskParameters.DownloadTaskParameters): Promise<void> {
        this.createServiceClients(taskParameters);
        await this.downloadFiles(taskParameters);

        console.log(tl.loc('TaskCompleted'));
    }

    private static s3Client: awsS3Client;

    private static createServiceClients(taskParameters: TaskParameters.DownloadTaskParameters) {
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

    private static async downloadFiles(taskParameters: TaskParameters.DownloadTaskParameters) {

        if (!fs.existsSync(taskParameters.targetFolder)) {
            tl.mkdirP(taskParameters.targetFolder);
        }

        const allDownloads = [];
        const allKeys = await this.fetchAllObjectKeys(taskParameters);
        for (const glob of taskParameters.globExpressions) {
            const matchedKeys = await this.matchObjectKeys(allKeys, taskParameters.sourceFolder, glob);
            for (const matchedKey of matchedKeys) {
                const dest: string = path.join(taskParameters.targetFolder, matchedKey);

                if (fs.existsSync(dest)) {
                    if (taskParameters.overwrite) {
                        console.log(tl.loc('FileOverwriteWarning', dest, matchedKey));
                    } else {
                        throw new Error(tl.loc('FileExistsError', dest, matchedKey));
                    }
                }

                console.log(tl.loc('QueueingDownload', matchedKey, taskParameters.targetFolder));
                const params = {
                    Bucket: taskParameters.bucketName,
                    Key: matchedKey
                };
                allDownloads.push(this.downloadFile(params, dest));
            }
        }

        return Promise.all(allDownloads);
    }

    private static downloadFile(s3Params: awsS3Client.GetObjectRequest, dest: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const dir: string = path.dirname(dest);
            if (!fs.existsSync(dir)) {
                tl.mkdirP(dir);
            }

            const file = fs.createWriteStream(dest);
            const s3Stream = this.s3Client.getObject(s3Params).createReadStream();
            s3Stream.on('error', reject);
            file.on('error', reject);
            file.on('close', resolve);
            s3Stream.pipe(file);
        });
    }

    private static async fetchAllObjectKeys(taskParameters: TaskParameters.DownloadTaskParameters) : Promise<string[]> {
        if (taskParameters.sourceFolder) {
            console.log(tl.loc('ListingKeysFromPrefix', taskParameters.sourceFolder, taskParameters.bucketName));
        } else {
            console.log(tl.loc('ListingKeysFromRoot', taskParameters.bucketName));
        }

        const allKeys: string[] = [];
        let nextToken : string = null;
        do {
            const params: awsS3Client.ListObjectsRequest = {
                Bucket: taskParameters.bucketName,
                Prefix: taskParameters.sourceFolder,
                Marker: nextToken
            };
            try {
                const s3Data = await this.s3Client.listObjects(params).promise();
                nextToken = s3Data.NextMarker;
                s3Data.Contents.forEach((s3object) => {
                    // AWS IDE toolkits can cause 0 byte 'folder markers' to be in the bucket,
                    // filter those out
                    if (!s3object.Key.endsWith('_$folder$')) {
                        allKeys.push(s3object.Key);
                    }
                });
            } catch (err) {
                console.error(err);
                nextToken = null;
            }
        } while (nextToken);

        return allKeys;
    }

    private static async matchObjectKeys(allKeys: string[], sourcePrefix: string, glob: string): Promise<string[]> {
        let sourcePrefixLen: number = 0;
        if (sourcePrefix) {
            console.log(tl.loc('GlobbingFromPrefix', sourcePrefix, glob));
            sourcePrefixLen = sourcePrefix.length + 1;
        } else {
            console.log(tl.loc('GlobbingFromRoot', glob));
        }

        const matcher = new mm.Minimatch(glob);
        const matchedKeys: string[] = [];
        allKeys.forEach((key) => {
            const keyToTest: string = key.substring(sourcePrefixLen);
            if (matcher.match(keyToTest)) {
                tl.debug(tl.loc('MatchedKey', key));
                matchedKeys.push(key);
            }
        });

        return matchedKeys;
    }

}
