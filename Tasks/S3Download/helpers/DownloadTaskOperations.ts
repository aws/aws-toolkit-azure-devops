/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import mm = require('minimatch');

import S3 = require('aws-sdk/clients/s3');
import Parameters = require('./DownloadTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async downloadArtifacts(taskParameters: Parameters.TaskParameters): Promise<void> {
        this.createServiceClients(taskParameters);

        const exists = await this.testBucketExists(taskParameters.bucketName);
        if (!exists) {
            throw new Error(tl.loc('BucketNotExist', taskParameters.bucketName));
        }

        await this.downloadFiles(taskParameters);

        console.log(tl.loc('TaskCompleted'));
    }

    private static s3Client: S3;

    private static createServiceClients(taskParameters: Parameters.TaskParameters) {

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            s3ForcePathStyle: taskParameters.forcePathStyleAddressing
        };
        this.s3Client = sdkutils.createAndConfigureSdkClient(S3, s3Opts, taskParameters, tl.debug);
    }

    private static async testBucketExists(bucketName: string): Promise<boolean> {
        try {
            await this.s3Client.headBucket({ Bucket: bucketName}).promise();
            return true;
        } catch (err) {
            return false;
        }
    }

    private static async downloadFiles(taskParameters: Parameters.TaskParameters) {

        let msgSource: string;
        if (taskParameters.sourceFolder) {
            msgSource = taskParameters.sourceFolder;
        } else {
            msgSource = '/';
        }
        console.log(tl.loc('DownloadingFiles', msgSource, taskParameters.bucketName, taskParameters.targetFolder ));

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

                console.log(tl.loc('QueueingDownload', matchedKey));
                const params = {
                    Bucket: taskParameters.bucketName,
                    Key: matchedKey
                };
                allDownloads.push(this.downloadFile(params, dest));
            }
        }

        return Promise.all(allDownloads);
    }

    private static downloadFile(s3Params: S3.GetObjectRequest, dest: string): Promise<void> {
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

    private static async fetchAllObjectKeys(taskParameters: Parameters.TaskParameters) : Promise<string[]> {
        if (taskParameters.sourceFolder) {
            console.log(tl.loc('ListingKeysFromPrefix', taskParameters.sourceFolder, taskParameters.bucketName));
        } else {
            console.log(tl.loc('ListingKeysFromRoot', taskParameters.bucketName));
        }

        const allKeys: string[] = [];
        let nextToken : string = null;
        do {
            const params: S3.ListObjectsRequest = {
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
