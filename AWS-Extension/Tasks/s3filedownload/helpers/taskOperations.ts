import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import mm = require('minimatch');
import Q = require('q');

import awsS3Client = require('aws-sdk/clients/s3');
import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async downloadArtifacts(taskParameters: TaskParameters.AwsS3FileDownloadTaskParameters): Promise<void> {
        const s3Config = {
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            s3ForcePathStyle: true
        };

        const s3 = new awsS3Client(s3Config);
        await TaskOperations.downloadFiles(taskParameters, s3);
    }

    private static async downloadFiles(taskParameters: TaskParameters.AwsS3FileDownloadTaskParameters, s3: awsS3Client) {
        const allDownloads = [];
        const allKeys = await this.fetchAllObjectKeys(taskParameters, s3);
        for (const glob of taskParameters.globExpressions) {
            const matchedKeys = await this.matchObjectKeys(allKeys, taskParameters.sourceFolder, glob);
            for (const matchedKey of matchedKeys) {
                console.log(`Starting download of ${matchedKey} to ${taskParameters.targetFolder}`);

                const params = {
                    Bucket: taskParameters.bucketName,
                    Key: matchedKey
                };
                allDownloads.push(this.downloadFile(s3, params, path.join(taskParameters.targetFolder, matchedKey)));
            }
        }

        return Promise.all(allDownloads);
    }

    private static downloadFile(s3: awsS3Client, s3Params: awsS3Client.GetObjectRequest, dest: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const dir: string = path.dirname(dest);
            if (!fs.existsSync(dir)) {
                tl.mkdirP(dir);
            }

            const file = fs.createWriteStream(dest);
            const s3Stream = s3.getObject(s3Params).createReadStream();
            s3Stream.on('error', reject);
            file.on('error', reject);
            file.on('close', resolve);
            s3Stream.pipe(file);
        });
    }

    private static async fetchAllObjectKeys(taskParameters: TaskParameters.AwsS3FileDownloadTaskParameters,
                                            s3: awsS3Client) : Promise<string[]> {
        const allKeys: string[] = [];
        let nextToken : string = null;
        do {
            const params: awsS3Client.ListObjectsRequest = {
                Bucket: taskParameters.bucketName,
                Prefix: taskParameters.sourceFolder,
                Marker: nextToken
            };
            try {
                const s3Data = await s3.listObjects(params).promise();
                nextToken = s3Data.NextMarker;
                s3Data.Contents.forEach((s3object) => allKeys.push(s3object.Key));
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
            tl.debug(`Globbing object keys with prefix '${sourcePrefix}' against '${glob}' to determine file downloads`);
            sourcePrefixLen = sourcePrefix.length + 1;
        } else {
            tl.debug(`Globbing object keys from bucket root against '${glob}' to determine file downloads`);
        }

        const matcher = new mm.Minimatch(glob);
        const matchedKeys: string[] = [];
        allKeys.forEach((key) => {
            const keyToTest: string = key.substring(sourcePrefixLen);
            if (matcher.match(keyToTest)) {
                tl.debug(`...matched key ${key}`);
                matchedKeys.push(key);
            }
        });

        return matchedKeys;
    }

}
