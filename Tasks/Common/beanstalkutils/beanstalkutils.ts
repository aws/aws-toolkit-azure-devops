/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import archiver = require('archiver')
import Beanstalk = require('aws-sdk/clients/elasticbeanstalk')
import S3 = require('aws-sdk/clients/s3')
import fs = require('fs')
import path = require('path')
import Q = require('q')
import tl = require('vsts-task-lib/task')

export class BeanstalkUtils {
    public static async determineS3Bucket(beanstalkClient: Beanstalk): Promise<string> {
        const response = await beanstalkClient.createStorageLocation().promise()
        console.log(tl.loc('DeterminedBucket', response.S3Bucket))

        return response.S3Bucket
    }

    public static async prepareAspNetCoreBundle(dotnetPublishPath: string, tempDirectory: string): Promise<string> {
        const defer = Q.defer()

        const deploymentBundle = path.join(tempDirectory, 'ebDeploymentBundle.zip')
        const output = fs.createWriteStream(deploymentBundle)
        console.log(tl.loc('CreatingBeanstalkBundle', deploymentBundle))

        const archive = archiver('zip')

        output.on('close', function() {
            console.log(tl.loc('ArchiveSize', archive.pointer()))
            defer.resolve(deploymentBundle)
        })

        archive.on('error', function(err: any) {
            console.log(tl.loc('ZipError', err))
            defer.reject(err)
        })

        archive.pipe(output)

        console.log(tl.loc('PublishingPath', dotnetPublishPath))
        const stat = fs.statSync(dotnetPublishPath)
        if (stat.isFile()) {
            archive.file(dotnetPublishPath, { name: path.basename(dotnetPublishPath) })
            console.log(tl.loc('AddingAspNetCoreBundle', dotnetPublishPath))

            const manifest = this.generateManifest('./' + path.basename(dotnetPublishPath), '/')
            archive.append(manifest, { name: 'aws-windows-deployment-manifest.json' })
            console.log(tl.loc('AddingManifest'))
        } else {
            archive.directory(dotnetPublishPath, '/app/')
            console.log(tl.loc('AddingFilesFromDotnetPublish'))

            const manifest = this.generateManifest('/app/', '/')
            archive.append(manifest, { name: 'aws-windows-deployment-manifest.json' })
            console.log(tl.loc('AddingManifest'))
        }

        archive.finalize()
        await defer.promise

        console.log(tl.loc('BundleComplete'))

        return deploymentBundle
    }

    public static constructVersionLabel(userVersionLabel: string): string {
        if (userVersionLabel) {
            return userVersionLabel
        }

        return `v${new Date().getTime()}`
    }

    public static generateManifest(appBundle: string, iisPath: string): string {
        const manifest = `{
"manifestVersion": 1,
"deployments": {

"aspNetCoreWeb": [
  {
    "name": "app",
    "parameters": {
      "appBundle": "${appBundle}",

      "iisPath": "${iisPath}",
      "iisWebSite": "Default Web Site"
    }
  }
]
}
}`

        return manifest
    }

    public static async uploadBundle(
        s3Client: S3,
        applicationBundlePath: string,
        bucketName: string,
        objectKey: string
    ): Promise<void> {
        console.log(tl.loc('UploadingBundle', applicationBundlePath, objectKey, bucketName))
        const fileBuffer = fs.createReadStream(applicationBundlePath)
        try {
            const response: S3.ManagedUpload.SendData = await s3Client
                .upload({
                    Bucket: bucketName,
                    Key: objectKey,
                    Body: fileBuffer
                })
                .promise()
            console.log(tl.loc('BundleUploadCompleted'))
        } catch (err) {
            console.error(tl.loc('BundleUploadFailed', (err as Error).message), err)
            throw err
        }
    }

    public static async verifyApplicationExists(beanstalkClient: Beanstalk, applicationName: string): Promise<void> {
        let appExists: boolean = false

        try {
            const response = await beanstalkClient
                .describeApplications({
                    ApplicationNames: [applicationName]
                })
                .promise()

            tl.debug(`Query for application ${applicationName} yield ${response.Applications.length} items`)
            appExists = response.Applications.length === 1
        } catch (err) {
            console.log(tl.loc('ApplicationExistsQueryError', applicationName, err))
        }

        if (!appExists) {
            throw new Error(tl.loc('ApplicationDoesNotExist', applicationName))
        }
    }

    public static async verifyEnvironmentExists(
        beanstalkClient: Beanstalk,
        applicationName: string,
        environmentName: string
    ): Promise<void> {
        let envExists: boolean = false

        try {
            const response = await beanstalkClient
                .describeEnvironments({
                    ApplicationName: applicationName,
                    EnvironmentNames: [environmentName],
                    IncludeDeleted: false
                })
                .promise()

            tl.debug(`Query for environment ${environmentName} yielded ${response.Environments.length} items`)
            envExists = response.Environments.length === 1
        } catch (err) {
            console.log(tl.loc('EnvironmentExistsQueryError', applicationName, environmentName, err))
        }

        if (!envExists) {
            throw new Error(tl.loc('EnvironmentDoesNotExist', environmentName, applicationName))
        }
    }
}
