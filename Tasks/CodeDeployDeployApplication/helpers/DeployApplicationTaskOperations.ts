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
import Q = require('q');
import archiver = require('archiver');
import CodeDeploy = require('aws-sdk/clients/codedeploy');
import S3 = require('aws-sdk/clients/s3');
import Parameters = require('./DeployApplicationTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async deploy(taskParameters: Parameters.TaskParameters): Promise<void> {

        this.createServiceClients(taskParameters);

        await this.verifyResourcesExist(taskParameters.applicationName, taskParameters.deploymentGroupName);

        const bundleKey = await this.uploadBundle(taskParameters);
        const deploymentId: string = await this.deployRevision(taskParameters, bundleKey);

        if (taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable));
            tl.setVariable(taskParameters.outputVariable, deploymentId);
        }

        await this.waitForDeploymentCompletion(taskParameters.applicationName, deploymentId);

        console.log(tl.loc('TaskCompleted', taskParameters.applicationName));
    }

    private static codeDeployClient: CodeDeploy;
    private static s3Client: S3;

    private static createServiceClients(taskParameters: Parameters.TaskParameters) {

        const codeDeployOpts: CodeDeploy.ClientConfiguration = {
            apiVersion: '2014-10-06',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };
        this.codeDeployClient = sdkutils.createAndConfigureSdkClient(CodeDeploy, codeDeployOpts, taskParameters, tl.debug);

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };
        this.s3Client = sdkutils.createAndConfigureSdkClient(S3, s3Opts, taskParameters, tl.debug);
    }

    private static async verifyResourcesExist(appName: string, groupName: string): Promise<void> {

        try {
            await this.codeDeployClient.getApplication({ applicationName: appName }).promise();
        } catch (err) {
            throw new Error(tl.loc('ApplicationDoesNotExist', appName));
        }

        try {
            await this.codeDeployClient.getDeploymentGroup({applicationName: appName, deploymentGroupName: groupName}).promise();
        } catch (err) {
            throw new Error(tl.loc('DeploymentGroupDoesNotExist', groupName, appName));
        }
    }

    private static async uploadBundle(taskParameters: Parameters.TaskParameters): Promise<string> {

        let archiveName: string;
        let autoCreatedArchive: boolean = false;
        if (tl.stats(taskParameters.revisionBundle).isDirectory()) {
            autoCreatedArchive = true;
            archiveName = await this.createDeploymentArchive(taskParameters.revisionBundle, taskParameters.applicationName);
        } else {
            archiveName = taskParameters.revisionBundle;
        }

        let key: string;
        const bundleFilename = path.basename(archiveName);
        if (taskParameters.bundlePrefix) {
            key = taskParameters.bundlePrefix + '/' + bundleFilename;
        } else {
            key = bundleFilename;
        }

        console.log(tl.loc('UploadingBundle', archiveName, key, taskParameters.bucketName));
        const fileBuffer = fs.createReadStream(archiveName);
        try {
            const response: S3.ManagedUpload.SendData = await this.s3Client.upload({
                Bucket: taskParameters.bucketName,
                Key: key,
                Body: fileBuffer
            }).promise();
            console.log(tl.loc('BundleUploadCompleted'));

            // clean up the archive if we created one
            if (autoCreatedArchive) {
                console.log(tl.loc('DeletingUploadedBundle', archiveName));
                fs.unlinkSync(archiveName);
            }

            return key;
        } catch (err) {
            console.error(tl.loc('BundleUploadFailed', err.message), err);
            throw err;
        }
    }

    private static async createDeploymentArchive(bundleFolder: string, applicationName: string): Promise<string> {

        console.log(tl.loc('CreatingDeploymentBundleArchiveFromFolder', bundleFolder));

        // echo what we do with Elastic Beanstalk deployments and use time as a version suffix,
        // creating the zip file inside the supplied folder
        const versionSuffix = '.v' + new Date().getTime();
        // Agent.TempDirectory is a private temp location we can use
        const tempDir = tl.getVariable('Agent.TempDirectory');
        const archiveName = path.join(tempDir, applicationName + versionSuffix +  '.zip');

        const output = fs.createWriteStream(archiveName);
        const archive = archiver('zip');
        const defer = Q.defer();

        output.on('close', function() {
            console.log(tl.loc('ArchiveSize', archive.pointer()));
            defer.resolve(archiveName);
        });

        archive.on('error', function(err: any) {
            console.log(tl.loc('ZipError', err));
            defer.reject(err);
        });

        archive.pipe(output);

        archive.directory(bundleFolder, false);
        archive.finalize();
        await defer.promise;

        console.log(tl.loc('CreatedBundleArchive', archiveName));
        return archiveName;
    }

    private static async deployRevision(taskParameters: Parameters.TaskParameters, bundleKey: string): Promise<string> {
        console.log(tl.loc('DeployingRevision'));

        // use bundle key as taskParameters.revisionBundle might be pointing at a folder
        let archiveType: string = path.extname(bundleKey);
        if (archiveType && archiveType.length > 1) {
            // let the service error out if the type is not one they currently support
            archiveType = archiveType.substring(1).toLowerCase();
            tl.debug(`Setting archive type to ${archiveType} based on bundle file extension`);
        } else {
            tl.debug('Unable to determine archive type, assuming zip');
             archiveType = 'zip';
        }

        try {
            const request: CodeDeploy.CreateDeploymentInput = {
                applicationName: taskParameters.applicationName,
                deploymentGroupName: taskParameters.deploymentGroupName,
                description: taskParameters.description,
                fileExistsBehavior: taskParameters.fileExistsBehavior,
                ignoreApplicationStopFailures: taskParameters.ignoreApplicationStopFailures,
                updateOutdatedInstancesOnly: taskParameters.updateOutdatedInstancesOnly,
                revision: {
                    revisionType: 'S3',
                    s3Location: {
                        bucket: taskParameters.bucketName,
                        key: bundleKey,
                        bundleType: archiveType
                    }
                }
            };
            const response: CodeDeploy.CreateDeploymentOutput = await this.codeDeployClient.createDeployment(request).promise();
            console.log(tl.loc('DeploymentStarted', taskParameters.deploymentGroupName, taskParameters.applicationName, response.deploymentId));
            return response.deploymentId;
        } catch (err) {
            console.error(tl.loc('DeploymentError', err.message), err);
            throw err;
        }
    }

    private static async waitForDeploymentCompletion(applicationName: string, deploymentId: string) : Promise<void> {

         return new Promise<void>((resolve, reject) => {
            console.log(tl.loc('WaitingForDeployment'));

            this.codeDeployClient.waitFor('deploymentSuccessful',
                                          { deploymentId },
                                          function(err: AWSError, data: CodeDeploy.GetDeploymentOutput) {
                if (err) {
                    throw new Error(tl.loc('DeploymentFailed', applicationName, err.message));
                } else {
                    console.log(tl.loc('WaitConditionSatisifed'));
                }
            });
         });
    }
}
