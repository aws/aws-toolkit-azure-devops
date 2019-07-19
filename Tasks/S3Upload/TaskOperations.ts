/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as S3 from 'aws-sdk/clients/s3'
import { knownMimeTypes, testBucketExists } from 'Common/s3'
import * as fs from 'fs'
import * as path from 'path'
import * as tl from 'vsts-task-lib/task'
import {
    awsKeyManagementValue,
    customerKeyManagementValue,
    noKeyManagementValue,
    TaskParameters
} from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly s3Client: S3,
        public readonly region: string,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        if (this.taskParameters.createBucket) {
            await this.createBucketIfNotExist(this.taskParameters.bucketName, this.region)
        } else {
            const exists = await testBucketExists(this.s3Client, this.taskParameters.bucketName)
            if (!exists) {
                throw new Error(tl.loc('BucketNotExistNoAutocreate', this.taskParameters.bucketName))
            }
        }

        await this.uploadFiles()
        console.log(tl.loc('TaskCompleted'))
    }

    public findMatchingFiles(taskParameters: TaskParameters): string[] {
        console.log(`Searching ${taskParameters.sourceFolder} for files to upload`)
        taskParameters.sourceFolder = path.normalize(taskParameters.sourceFolder)
        // Follows sym links, but is currently broken: https://github.com/aws/aws-vsts-tools/issues/178
        const allPaths = tl.find(taskParameters.sourceFolder)
        tl.debug(tl.loc('AllPaths', allPaths))
        const matchedPaths = tl.match(allPaths, taskParameters.globExpressions, taskParameters.sourceFolder)
        tl.debug(tl.loc('MatchedPaths', matchedPaths))
        const matchedFiles = matchedPaths.filter(itemPath => !tl.stats(itemPath).isDirectory())
        tl.debug(tl.loc('MatchedFiles', matchedFiles))
        tl.debug(tl.loc('FoundNFiles', matchedFiles.length))

        return matchedFiles
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

    private getCacheControl(currentFile: string): string {
        for (const expression of this.taskParameters.cacheControl) {
            const firstIndex = expression.indexOf('=')
            if (firstIndex < 1 || firstIndex === expression.length - 1) {
                throw new Error(tl.loc('InvalidExpression', expression))
            }
            const matchStatemnt = expression.substring(0, firstIndex).trim()
            const cacheControlSettings = expression.substring(firstIndex + 1).trim()
            const result = tl.match([currentFile], matchStatemnt, this.taskParameters.sourceFolder)
            if (result.length > 0) {
                return cacheControlSettings
            }
        }

        return ''
    }

    private buildS3Request(request: S3.PutObjectRequest, matchedFile: string) {
        if (this.taskParameters.contentEncoding) {
            request.ContentEncoding = this.taskParameters.contentEncoding
        }

        if (this.taskParameters.cacheControl && this.taskParameters.cacheControl.length > 0) {
            const cacheControl = this.getCacheControl(matchedFile)
            if (cacheControl) {
                request.CacheControl = cacheControl
            }
        }

        if (this.taskParameters.filesAcl) {
            request.ACL = this.taskParameters.filesAcl
        }
        switch (this.taskParameters.keyManagement) {
            case noKeyManagementValue:
                break

            case awsKeyManagementValue: {
                if (this.taskParameters.encryptionAlgorithm) {
                    request.ServerSideEncryption = this.taskParameters.encryptionAlgorithm
                }
                if (this.taskParameters.kmsMasterKeyId) {
                    request.SSEKMSKeyId = this.taskParameters.kmsMasterKeyId
                }
                break
            }

            case customerKeyManagementValue: {
                if (this.taskParameters.encryptionAlgorithm) {
                    request.SSECustomerAlgorithm = this.taskParameters.encryptionAlgorithm
                }
                if (this.taskParameters.customerKey.length > 0) {
                    request.SSECustomerKey = this.taskParameters.customerKey
                }
                break
            }
        }
    }

    private async uploadFiles() {
        let msgTarget: string
        if (this.taskParameters.targetFolder) {
            msgTarget = this.taskParameters.targetFolder
        } else {
            msgTarget = '/'
        }
        console.log(
            tl.loc('UploadingFiles', this.taskParameters.sourceFolder, msgTarget, this.taskParameters.bucketName)
        )

        const matchedFiles = this.findMatchingFiles(this.taskParameters)

        if (matchedFiles.length === 0) {
            tl.warning(
                tl.loc('NoMatchingFilesFound', this.taskParameters.sourceFolder, this.taskParameters.globExpressions)
            )
        }

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

            targetPath = targetPath.replace(/\\/g, '/')
            const stats = fs.lstatSync(matchedFile)
            if (!stats.isDirectory()) {
                const fileBuffer = fs.createReadStream(matchedFile)
                try {
                    let contentType: string | undefined
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
                        ContentType: contentType,
                        StorageClass: this.taskParameters.storageClass
                    }

                    this.buildS3Request(request, matchedFile)

                    await this.s3Client.upload(request).promise()
                    console.log(tl.loc('FileUploadCompleted', matchedFile, targetPath))
                } catch (err) {
                    console.error(tl.loc('FileUploadFailed'), err)
                    throw err
                }
            }
        }
    }
}
