/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task')
import path = require('path')
import fs = require('fs')
import Q = require('q')
import archiver = require('archiver')
import CodeDeploy = require('aws-sdk/clients/codedeploy')
import S3 = require('aws-sdk/clients/s3')
import { AWSError } from 'aws-sdk/lib/error'
import { SdkUtils } from 'sdkutils/sdkutils'
import { TaskParameters } from './DeployApplicationTaskParameters'

export class TaskOperations {
    public constructor(public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        await this.createServiceClients()

        await this.verifyResourcesExist()

        let bundleKey: string
        if (this.taskParameters.deploymentRevisionSource === TaskParameters.revisionSourceFromWorkspace) {
            bundleKey = await this.uploadBundle()
        } else {
            bundleKey = this.taskParameters.bundleKey
        }
        const deploymentId: string = await this.deployRevision(bundleKey)

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable))
            tl.setVariable(this.taskParameters.outputVariable, deploymentId)
        }

        await this.waitForDeploymentCompletion(
            this.taskParameters.applicationName,
            deploymentId,
            this.taskParameters.timeoutInMins
        )

        console.log(tl.loc('TaskCompleted', this.taskParameters.applicationName))
    }

    private codeDeployClient: CodeDeploy
    private s3Client: S3

    private async createServiceClients(): Promise<void> {
        const codeDeployOpts: CodeDeploy.ClientConfiguration = {
            apiVersion: '2014-10-06'
        }
        this.codeDeployClient = await SdkUtils.createAndConfigureSdkClient(
            CodeDeploy,
            codeDeployOpts,
            this.taskParameters,
            tl.debug
        )

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01'
        }
        this.s3Client = await SdkUtils.createAndConfigureSdkClient(S3, s3Opts, this.taskParameters, tl.debug)
    }

    private async verifyResourcesExist(): Promise<void> {
        try {
            await this.codeDeployClient
                .getApplication({ applicationName: this.taskParameters.applicationName })
                .promise()
        } catch (err) {
            throw new Error(tl.loc('ApplicationDoesNotExist', this.taskParameters.applicationName))
        }

        try {
            await this.codeDeployClient
                .getDeploymentGroup({
                    applicationName: this.taskParameters.applicationName,
                    deploymentGroupName: this.taskParameters.deploymentGroupName
                })
                .promise()
        } catch (err) {
            throw new Error(
                tl.loc(
                    'DeploymentGroupDoesNotExist',
                    this.taskParameters.deploymentGroupName,
                    this.taskParameters.applicationName
                )
            )
        }

        if (this.taskParameters.deploymentRevisionSource === TaskParameters.revisionSourceFromS3) {
            try {
                await this.s3Client
                    .headObject({
                        Bucket: this.taskParameters.bucketName,
                        Key: this.taskParameters.bundleKey
                    })
                    .promise()
            } catch (err) {
                throw new Error(
                    tl.loc('RevisionBundleDoesNotExist', this.taskParameters.bundleKey, this.taskParameters.bucketName)
                )
            }
        }
    }

    private async uploadBundle(): Promise<string> {
        let archiveName: string
        let autoCreatedArchive: boolean = false
        if (tl.stats(this.taskParameters.revisionBundle).isDirectory()) {
            autoCreatedArchive = true
            archiveName = await this.createDeploymentArchive(
                this.taskParameters.revisionBundle,
                this.taskParameters.applicationName
            )
        } else {
            archiveName = this.taskParameters.revisionBundle
        }

        let key: string
        const bundleFilename = path.basename(archiveName)
        if (this.taskParameters.bundlePrefix) {
            key = this.taskParameters.bundlePrefix + '/' + bundleFilename
        } else {
            key = bundleFilename
        }

        console.log(tl.loc('UploadingBundle', archiveName, key, this.taskParameters.bucketName))
        const fileBuffer = fs.createReadStream(archiveName)
        try {
            const response: S3.ManagedUpload.SendData = await this.s3Client
                .upload({
                    Bucket: this.taskParameters.bucketName,
                    Key: key,
                    Body: fileBuffer
                })
                .promise()
            console.log(tl.loc('BundleUploadCompleted'))

            // clean up the archive if we created one
            if (autoCreatedArchive) {
                console.log(tl.loc('DeletingUploadedBundle', archiveName))
                fs.unlinkSync(archiveName)
            }

            return key
        } catch (err) {
            console.error(tl.loc('BundleUploadFailed', err.message), err)
            throw err
        }
    }

    private async createDeploymentArchive(bundleFolder: string, applicationName: string): Promise<string> {
        console.log(tl.loc('CreatingDeploymentBundleArchiveFromFolder', bundleFolder))

        // echo what we do with Elastic Beanstalk deployments and use time as a version suffix,
        // creating the zip file inside the supplied folder
        const versionSuffix = '.v' + new Date().getTime()
        const tempDir = SdkUtils.getTempLocation()
        const archiveName = path.join(tempDir, applicationName + versionSuffix + '.zip')

        const output = fs.createWriteStream(archiveName)
        const archive = archiver('zip')
        const defer = Q.defer()

        output.on('close', function() {
            console.log(tl.loc('ArchiveSize', archive.pointer()))
            defer.resolve(archiveName)
        })

        archive.on('error', function(err: any) {
            console.log(tl.loc('ZipError', err))
            defer.reject(err)
        })

        archive.pipe(output)

        archive.directory(bundleFolder, false)
        archive.finalize()
        await defer.promise

        console.log(tl.loc('CreatedBundleArchive', archiveName))
        return archiveName
    }

    private async deployRevision(bundleKey: string): Promise<string> {
        console.log(tl.loc('DeployingRevision'))

        // use bundle key as taskParameters.revisionBundle might be pointing at a folder
        let archiveType: string = path.extname(bundleKey)
        if (archiveType && archiveType.length > 1) {
            // let the service error out if the type is not one they currently support
            archiveType = archiveType.substring(1).toLowerCase()
            tl.debug(`Setting archive type to ${archiveType} based on bundle file extension`)
        } else {
            tl.debug('Unable to determine archive type, assuming zip')
            archiveType = 'zip'
        }

        try {
            const request: CodeDeploy.CreateDeploymentInput = {
                applicationName: this.taskParameters.applicationName,
                deploymentGroupName: this.taskParameters.deploymentGroupName,
                description: this.taskParameters.description,
                fileExistsBehavior: this.taskParameters.fileExistsBehavior,
                ignoreApplicationStopFailures: this.taskParameters.ignoreApplicationStopFailures,
                updateOutdatedInstancesOnly: this.taskParameters.updateOutdatedInstancesOnly,
                revision: {
                    revisionType: 'S3',
                    s3Location: {
                        bucket: this.taskParameters.bucketName,
                        key: bundleKey,
                        bundleType: archiveType
                    }
                }
            }
            const response: CodeDeploy.CreateDeploymentOutput = await this.codeDeployClient
                .createDeployment(request)
                .promise()
            console.log(
                tl.loc(
                    'DeploymentStarted',
                    this.taskParameters.deploymentGroupName,
                    this.taskParameters.applicationName,
                    response.deploymentId
                )
            )
            return response.deploymentId
        } catch (err) {
            console.error(tl.loc('DeploymentError', err.message), err)
            throw err
        }
    }

    private async waitForDeploymentCompletion(
        applicationName: string,
        deploymentId: string,
        timeout: number
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            console.log(tl.loc('WaitingForDeployment'))

            const params: any = this.setWaiterParams(deploymentId, timeout)
            this.codeDeployClient.waitFor('deploymentSuccessful', params, function(
                err: AWSError,
                data: CodeDeploy.GetDeploymentOutput
            ) {
                if (err) {
                    throw new Error(tl.loc('DeploymentFailed', applicationName, err.message))
                } else {
                    console.log(tl.loc('WaitConditionSatisifed'))
                }
            })
        })
    }
}
