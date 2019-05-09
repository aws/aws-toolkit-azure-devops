/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import S3 = require('aws-sdk/clients/s3')
import fs = require('fs')
import path = require('path')
import { knownMimeTypes, testBucketExists } from 'sdkutils/s3utils'
import tl = require('vsts-task-lib/task')
import { awsKeyManagementValue,
        customerKeyManagementValue,
        noKeyManagementValue,
        TaskParameters } from './UploadTaskParameters'

export class TaskOperations {
    public constructor(
        public readonly s3Client: S3,
        public readonly region: string,
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        if (this.taskParameters.createBucket) {
            await this.createBucketIfNotExist(
                this.taskParameters.bucketName,
                this.region)
        } else {
            const exists = await testBucketExists(this.s3Client, this.taskParameters.bucketName)
            if (!exists) {
                throw new Error(tl.loc('BucketNotExistNoAutocreate', this.taskParameters.bucketName))
            }
        }

        await this.uploadFiles()
        console.log(tl.loc('TaskCompleted'))
    }

    private async createBucketIfNotExist(bucketName: string, region: string): Promise<void> {
        const exists = await testBucketExists(this.s3Client, bucketName)
        if (exists) {
            return
        }

        try {
            console.log(tl.loc('BucketNotExistCreating', bucketName, region))
            await this.s3Client.createBucket({ Bucket: bucketName }).promise()
            console.log(tl.loc('BucketCreated'))
        } catch (err) {
            console.log(tl.loc('CreateBucketFailure'), err)
            throw err
        }
    }
    private async uploadFiles() {

        let msgTarget: string
        if (this.taskParameters.targetFolder) {
            msgTarget = this.taskParameters.targetFolder
        } else {
            msgTarget = '/'
        }
        console.log(tl.loc(
            'UploadingFiles',
            this.taskParameters.sourceFolder,
            msgTarget,
            this.taskParameters.bucketName))

        const matchedFiles = this.findFiles()
        for (const matchedFile of matchedFiles) {
            let relativePath = matchedFile.substring(this.taskParameters.sourceFolder.length)
            if (relativePath.startsWith(path.sep)) {
                relativePath = relativePath.substr(1)
            }
            let targetPath = relativePath

            if (this.taskParameters.flattenFolders) {
                const flatFileName = path.basename(matchedFile)
                if (this.taskParameters.targetFolder) {
                    targetPath = path.join(this.taskParameters.targetFolder, flatFileName)
                } else {
                    targetPath = flatFileName
                }
            } else {
                if (this.taskParameters.targetFolder) {
                    targetPath = path.join(this.taskParameters.targetFolder, relativePath)
                } else {
                    targetPath = relativePath
                }
            }

            const targetDir = path.dirname(targetPath)
            targetPath = targetPath.replace(/\\/g, '/')
            const stats = fs.lstatSync(matchedFile)
            if (!stats.isDirectory()) {
                const fileBuffer = fs.createReadStream(matchedFile)
                try {
                    let contentType: string
                    if (this.taskParameters.contentType) {
                        contentType = this.taskParameters.contentType
                    } else {
                        contentType = knownMimeTypes.get(path.extname(matchedFile))
                        if (!contentType) {
                            contentType = 'application/octet-stream'
                        }
                    }
                    console.log(tl.loc('UploadingFile', matchedFile, contentType))

                    const request: S3.PutObjectRequest = {
                        Bucket: this.taskParameters.bucketName,
                        Key: targetPath,
                        Body: fileBuffer,
                        ACL: this.taskParameters.filesAcl,
                        ContentType: contentType,
                        StorageClass: this.taskParameters.storageClass
                    }
                    switch (this.taskParameters.keyManagement) {
                        case noKeyManagementValue:
                            break

                        case awsKeyManagementValue: {
                            request.ServerSideEncryption = this.taskParameters.encryptionAlgorithm
                            request.SSEKMSKeyId = this.taskParameters.kmsMasterKeyId
                            break
                        }

                        case customerKeyManagementValue: {
                            request.SSECustomerAlgorithm = this.taskParameters.encryptionAlgorithm
                            request.SSECustomerKey = this.taskParameters.customerKey
                            break
                        }
                    }

                    const response: S3.ManagedUpload.SendData = await this.s3Client.upload(request).promise()
                    console.log(tl.loc('FileUploadCompleted', matchedFile, targetPath))
                } catch (err) {
                    console.error(tl.loc('FileUploadFailed'), err)
                    throw err
                }
            }
        }
    }

    private findFiles(): string[] {
        console.log(`Searching ${this.taskParameters.sourceFolder} for files to upload`)
        this.taskParameters.sourceFolder = path.normalize(this.taskParameters.sourceFolder)
        const allPaths = tl.find(this.taskParameters.sourceFolder) // default find options (follow sym links)
        tl.debug(tl.loc('AllPaths', allPaths))
        const matchedPaths = tl.match(
            allPaths,
            this.taskParameters.globExpressions,
            this.taskParameters.sourceFolder) // default match options
        tl.debug(tl.loc('MatchedPaths', matchedPaths))
        const matchedFiles = matchedPaths.filter((itemPath) => !tl.stats(itemPath).isDirectory())
        tl.debug(tl.loc('MatchedFiles', matchedFiles))
        tl.debug(tl.loc('FoundNFiles', matchedFiles.length))

        return matchedFiles
    }
}
