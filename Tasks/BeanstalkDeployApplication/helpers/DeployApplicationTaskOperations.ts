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
import sdkutils = require('sdkutils/sdkutils');
import { BeanstalkUtils } from 'beanstalkutils/beanstalkutils';
import Beanstalk = require('aws-sdk/clients/elasticbeanstalk');
import S3 = require('aws-sdk/clients/s3');
import Parameters = require('./DeployApplicationTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import { TaskParameters } from './DeployApplicationTaskParameters';

export class TaskOperations {

    public static async deploy(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.constructServiceClients(taskParameters);

        await BeanstalkUtils.verifyApplicationExists(this.beanstalkClient, taskParameters.applicationName);
        await BeanstalkUtils.verifyEnvironmentExists(this.beanstalkClient, taskParameters.applicationName, taskParameters.environmentName);

        const versionLabel = BeanstalkUtils.constructVersionLabel(taskParameters.versionLabel);

        let s3Bucket: string;
        let s3Key: string;

        if (taskParameters.applicationType === taskParameters.applicationTypeAspNet
            || taskParameters.applicationType === taskParameters.applicationTypeAspNetCoreForWindows) {

            s3Bucket = await BeanstalkUtils.determineS3Bucket(this.beanstalkClient);
            let deploymentBundle: string;
            if (taskParameters.applicationType === taskParameters.applicationTypeAspNetCoreForWindows) {
                const tempDirectory = sdkutils.getTempLocation();
                deploymentBundle = await BeanstalkUtils.prepareAspNetCoreBundle(taskParameters.dotnetPublishPath, tempDirectory);
            } else {
                deploymentBundle = taskParameters.webDeploymentArchive;
            }

            s3Key = taskParameters.applicationName
                + '/' + taskParameters.environmentName
                + '/' + path.basename(deploymentBundle, '.zip')
                + '-'
                + versionLabel + '.zip';
            await BeanstalkUtils.uploadBundle(this.s3Client, deploymentBundle, s3Bucket, s3Key);
        } else {
            s3Bucket = taskParameters.deploymentBundleBucket;
            s3Key = taskParameters.deploymentBundleKey;
        }

        const startingEventDate = await this.getLatestEventDate(taskParameters.applicationName, taskParameters.environmentName);

        await this.updateEnvironment(s3Bucket,
                                     s3Key,
                                     taskParameters.applicationName,
                                     taskParameters.environmentName,
                                     versionLabel,
                                     taskParameters.description,
                                     taskParameters.applicationType === taskParameters.applicationTypeExistingVersion);

        await this.waitForDeploymentCompletion(taskParameters.applicationName, taskParameters.environmentName, startingEventDate);

        if (taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable, versionLabel));
            tl.setVariable(taskParameters.outputVariable, versionLabel);
        }

        console.log(tl.loc('TaskCompleted', taskParameters.applicationName));
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

    private static async updateEnvironment(bucketName: string,
                                            key: string,
                                            application: string,
                                            environment: string,
                                            versionLabel: string,
                                            description: string,
                                            isExistingVersion: boolean): Promise<void> {

        if (!isExistingVersion) {
            const sourceBundle: Beanstalk.S3Location = {
                'S3Bucket': bucketName,
                'S3Key': key
            };

            const versionRequest: Beanstalk.CreateApplicationVersionMessage = {
                ApplicationName: application,
                VersionLabel: versionLabel,
                SourceBundle: sourceBundle,
                Description: description
            };

            await this.beanstalkClient.createApplicationVersion(versionRequest).promise();
            if (description) {
                console.log(tl.loc('CreatedApplicationVersionWithDescription', versionRequest.VersionLabel, description, application));
            } else {
                console.log(tl.loc('CreatedApplicationVersion', versionRequest.VersionLabel, application));
            }
        } else {
            console.log(tl.loc('DeployingExistingVersion', versionLabel));
        }

        const request: Beanstalk.UpdateEnvironmentMessage = {
            ApplicationName: application,
            EnvironmentName: environment,
            VersionLabel: versionLabel
        };
        await this.beanstalkClient.updateEnvironment(request).promise();
        console.log(tl.loc('StartingApplicationDeployment', request.VersionLabel));
    }

    private static async waitForDeploymentCompletion(applicationName: string,
                                                     environmentName: string,
                                                     startingEventDate: Date): Promise<void> {

        const requestEnvironment: Beanstalk.DescribeEnvironmentsMessage = {
            ApplicationName: applicationName,
            EnvironmentNames: [environmentName]
        };

        const requestEvents: Beanstalk.DescribeEventsMessage = {
            ApplicationName: applicationName,
            EnvironmentName: environmentName,
            StartTime: startingEventDate
        };

        let lastPrintedEventDate = startingEventDate;

        console.log(tl.loc('WaitingForDeployment'));
        console.log(tl.loc('EventsComing'));

        let success = true;
        let environment: Beanstalk.EnvironmentDescription;
        do {
            await this.sleep(5000);

            const responseEnvironments = await this.beanstalkClient.describeEnvironments(requestEnvironment).promise();
            if (responseEnvironments.Environments.length === 0) {
                throw new Error(tl.loc('FailedToFindEnvironment'));
            }
            environment = responseEnvironments.Environments[0];

            requestEvents.StartTime = lastPrintedEventDate;
            const responseEvent = await this.beanstalkClient.describeEvents(requestEvents).promise();

            if (responseEvent.Events.length > 0) {
                for (let i = responseEvent.Events.length - 1; i >= 0; i--) {
                    const event = responseEvent.Events[i];
                    if (event.EventDate <= lastPrintedEventDate) {
                        continue;
                    }

                    console.log(event.EventDate + '   ' + event.Severity + '   ' + event.Message);

                    if (event.Message === 'Failed to deploy application.') {
                        success = false;
                    }
                }

                lastPrintedEventDate = responseEvent.Events[0].EventDate;
            }

        } while (environment.Status === 'Launching' || environment.Status === 'Updating');

        if (!success) {
            throw new Error(tl.loc('FailedToDeploy'));
        }
    }

    private static async getLatestEventDate(applicationName: string, environmentName: string): Promise<Date> {

        const requestEvents: Beanstalk.DescribeEventsMessage = {
            ApplicationName: applicationName,
            EnvironmentName: environmentName
        };

        const response = await this.beanstalkClient.describeEvents(requestEvents).promise();
        if (response.Events.length === 0) {
            return new Date();
        }

        return response.Events[0].EventDate;
    }

    private static sleep(timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, timeout);
        });
    }

}
