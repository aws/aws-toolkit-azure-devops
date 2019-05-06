/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import mm = require('minimatch')
import path = require('path')
import tl = require('vsts-task-lib/task')

import S3 = require('aws-sdk/clients/s3')
import { TaskParameters } from './DownloadTaskParameters'

export class TaskOperations {
    public constructor(
        public readonly s3Client: S3,
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        const exists = await this.testBucketExists(this.taskParameters.bucketName)
        if (!exists) {
            throw new Error(tl.loc('BucketNotExist', this.taskParameters.bucketName))
        }

        await this.downloadFiles()

        console.log(tl.loc('TaskCompleted'))
    }

    private async testBucketExists(bucketName: string): Promise<boolean> {
        try {
            await this.s3Client.headBucket({ Bucket: bucketName }).promise()

            return true
        } catch (err) {
            return false
        }
    }

    private async downloadFiles() {

        let msgSource: string
        if (this.taskParameters.sourceFolder) {
            msgSource = this.taskParameters.sourceFolder
        } else {
            msgSource = '/'
        }
        console.log(tl.loc(
            'DownloadingFiles',
            msgSource,
            this.taskParameters.bucketName,
            this.taskParameters.targetFolder))

        if (!fs.existsSync(this.taskParameters.targetFolder)) {
            tl.mkdirP(this.taskParameters.targetFolder)
        }

        const allDownloads = []
        const allKeys = await this.fetchAllObjectKeys()
        for (const glob of this.taskParameters.globExpressions) {
            const matchedKeys = await this.matchObjectKeys(allKeys, this.taskParameters.sourceFolder, glob)
            for (const matchedKey of matchedKeys) {
                let dest: string
                if (this.taskParameters.flattenFolders) {
                    const fname: string = path.basename(matchedKey)
                    dest = path.join(this.taskParameters.targetFolder, fname)
                } else {
                    dest = path.join(this.taskParameters.targetFolder, matchedKey)
                }

                if (fs.existsSync(dest)) {
                    if (this.taskParameters.overwrite) {
                        console.log(tl.loc('FileOverwriteWarning', dest, matchedKey))
                    } else {
                        throw new Error(tl.loc('FileExistsError', dest, matchedKey))
                    }
                }

                console.log(tl.loc('QueueingDownload', matchedKey))
                const params: S3.GetObjectRequest = {
                    Bucket: this.taskParameters.bucketName,
                    Key: matchedKey
                }
                if (this.taskParameters.keyManagement === TaskParameters.customerManagedKeyValue) {
                    params.SSECustomerAlgorithm = TaskParameters.aes256AlgorithmValue
                    params.SSECustomerKey = this.taskParameters.customerKey
                }
                allDownloads.push(this.downloadFile(params, dest))
            }
        }

        return Promise.all(allDownloads)
    }

    private async downloadFile(s3Params: S3.GetObjectRequest, dest: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {

            const dir: string = path.dirname(dest)
            if (!fs.existsSync(dir)) {
                tl.mkdirP(dir)
            }

            const file = fs.createWriteStream(dest)
            const s3Stream = this.s3Client.getObject(s3Params).createReadStream()
            s3Stream.on('error', reject)
            file.on('error', reject)
            file.on('close', resolve)
            s3Stream.pipe(file)
        })
    }

    private async fetchAllObjectKeys(): Promise<string[]> {
        if (this.taskParameters.sourceFolder) {
            console.log(tl.loc(
                'ListingKeysFromPrefix',
                this.taskParameters.sourceFolder,
                this.taskParameters.bucketName))
        } else {
            console.log(tl.loc('ListingKeysFromRoot', this.taskParameters.bucketName))
        }

        const allKeys: string[] = []
        let nextToken: string
        do {
            const params: S3.ListObjectsRequest = {
                Bucket: this.taskParameters.bucketName,
                Prefix: this.taskParameters.sourceFolder,
                Marker: nextToken
            }
            try {
                const s3Data = await this.s3Client.listObjects(params).promise()
                nextToken = s3Data.NextMarker
                s3Data.Contents.forEach((s3object) => {
                    // AWS IDE toolkits can cause 0 byte 'folder markers' to be in the bucket,
                    // filter those out
                    if (!s3object.Key.endsWith('_$folder$')) {
                        allKeys.push(s3object.Key)
                    }
                })
            } catch (err) {
                console.error(err)
                nextToken = undefined
            }
        } while (nextToken)

        return allKeys
    }

    private async matchObjectKeys(allKeys: string[], sourcePrefix: string, glob: string): Promise<string[]> {
        let sourcePrefixLen: number = 0
        if (sourcePrefix) {
            console.log(tl.loc('GlobbingFromPrefix', sourcePrefix, glob))
            sourcePrefixLen = sourcePrefix.length + 1
        } else {
            console.log(tl.loc('GlobbingFromRoot', glob))
        }

        const matcher = new mm.Minimatch(glob)
        const matchedKeys: string[] = []
        allKeys.forEach((key) => {
            const keyToTest: string = key.substring(sourcePrefixLen)
            if (matcher.match(keyToTest)) {
                tl.debug(tl.loc('MatchedKey', key))
                matchedKeys.push(key)
            }
        })

        return matchedKeys
    }
}
