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
import Beanstalk = require('aws-sdk/clients/elasticbeanstalk');
import S3 = require('aws-sdk/clients/s3');
import { BeanstalkUtils } from 'beanstalkutils/beanstalkutils';
import Parameters = require('./CreateApplicationVersionTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');
import { TaskParameters } from './CreateApplicationVersionTaskParameters';

export class TaskOperations {

    public static async execute(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.constructServiceClients(taskParameters);

        await BeanstalkUtils.verifyApplicationExists(this.beanstalkClient, taskParameters.applicationName);

        const versionLabel = BeanstalkUtils.constructVersionLabel(taskParameters.versionLabel);

        let s3Bucket: string;
        let s3Key: string;

        if (taskParameters.applicationType !== taskParameters.applicationTypeS3Archive) {

            s3Bucket = await BeanstalkUtils.determineS3Bucket(this.beanstalkClient);
            let deploymentBundle: string;
            if (taskParameters.applicationType === taskParameters.applicationTypeAspNetCoreForWindows) {
                const tempDirectory = sdkutils.getTempLocation();
                deploymentBundle = await BeanstalkUtils.prepareAspNetCoreBundle(taskParameters.dotnetPublishPath, tempDirectory);
            } else {
                deploymentBundle = taskParameters.webDeploymentArchive;
            }

            s3Key = taskParameters.applicationName + '/' + path.basename(deploymentBundle, '.zip') + '-' + versionLabel + '.zip';
            await BeanstalkUtils.uploadBundle(this.s3Client, deploymentBundle, s3Bucket, s3Key);
        } else {
            s3Bucket = taskParameters.deploymentBundleBucket;
            s3Key = taskParameters.deploymentBundleKey;
        }

        const sourceBundle: Beanstalk.S3Location = {
            'S3Bucket': s3Bucket,
            'S3Key': s3Key
        };

        const versionRequest: Beanstalk.CreateApplicationVersionMessage = {
            ApplicationName: taskParameters.applicationName,
            VersionLabel: versionLabel,
            SourceBundle: sourceBundle,
            Description: taskParameters.description
        };

        await this.beanstalkClient.createApplicationVersion(versionRequest).promise();
        if (taskParameters.description) {
            console.log(tl.loc('CreatedApplicationVersionWithDescription', versionRequest.VersionLabel, taskParameters.description, taskParameters.applicationName));
        } else {
            console.log(tl.loc('CreatedApplicationVersion', versionRequest.VersionLabel, taskParameters.applicationName));
        }

        if (taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable, versionLabel));
            tl.setVariable(taskParameters.outputVariable, versionLabel);
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private static beanstalkClient: Beanstalk;
    private static s3Client: S3;

    private static async constructServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const beanstalkOpts: Beanstalk.ClientConfiguration = {
            apiVersion: '2010-12-01',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.beanstalkClient = sdkutils.createAndConfigureSdkClient(Beanstalk, beanstalkOpts, taskParameters, tl.debug);

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.s3Client = sdkutils.createAndConfigureSdkClient(S3, s3Opts, taskParameters, tl.debug);
    }

}
