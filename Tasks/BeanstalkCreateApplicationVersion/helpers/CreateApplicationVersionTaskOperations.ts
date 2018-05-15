/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
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
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { BeanstalkUtils } from 'beanstalkutils/beanstalkutils';
import { TaskParameters } from './CreateApplicationVersionTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        await this.constructServiceClients();

        await BeanstalkUtils.verifyApplicationExists(this.beanstalkClient, this.taskParameters.applicationName);

        const versionLabel = BeanstalkUtils.constructVersionLabel(this.taskParameters.versionLabel);

        let s3Bucket: string;
        let s3Key: string;

        if (this.taskParameters.applicationType !== TaskParameters.applicationTypeS3Archive) {

            s3Bucket = await BeanstalkUtils.determineS3Bucket(this.beanstalkClient);
            let deploymentBundle: string;
            if (this.taskParameters.applicationType === TaskParameters.applicationTypeAspNetCoreForWindows) {
                const tempDirectory = SdkUtils.getTempLocation();
                deploymentBundle = await BeanstalkUtils.prepareAspNetCoreBundle(this.taskParameters.dotnetPublishPath, tempDirectory);
            } else {
                deploymentBundle = this.taskParameters.webDeploymentArchive;
            }

            s3Key = this.taskParameters.applicationName + '/' + path.basename(deploymentBundle, '.zip') + '-' + versionLabel + '.zip';
            await BeanstalkUtils.uploadBundle(this.s3Client, deploymentBundle, s3Bucket, s3Key);
        } else {
            s3Bucket = this.taskParameters.deploymentBundleBucket;
            s3Key = this.taskParameters.deploymentBundleKey;
        }

        const sourceBundle: Beanstalk.S3Location = {
            'S3Bucket': s3Bucket,
            'S3Key': s3Key
        };

        const versionRequest: Beanstalk.CreateApplicationVersionMessage = {
            ApplicationName: this.taskParameters.applicationName,
            VersionLabel: versionLabel,
            SourceBundle: sourceBundle,
            Description: this.taskParameters.description
        };

        await this.beanstalkClient.createApplicationVersion(versionRequest).promise();
        if (this.taskParameters.description) {
            console.log(tl.loc('CreatedApplicationVersionWithDescription', versionRequest.VersionLabel, this.taskParameters.description, this.taskParameters.applicationName));
        } else {
            console.log(tl.loc('CreatedApplicationVersion', versionRequest.VersionLabel, this.taskParameters.applicationName));
        }

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable, versionLabel));
            tl.setVariable(this.taskParameters.outputVariable, versionLabel);
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private beanstalkClient: Beanstalk;
    private s3Client: S3;

    private async constructServiceClients(): Promise<void> {

        const beanstalkOpts: Beanstalk.ClientConfiguration = {
            apiVersion: '2010-12-01'
        };
        this.beanstalkClient = await SdkUtils.createAndConfigureSdkClient(Beanstalk, beanstalkOpts, this.taskParameters, tl.debug);

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01'
        };
        this.s3Client = await SdkUtils.createAndConfigureSdkClient(S3, s3Opts, this.taskParameters, tl.debug);
    }

}
