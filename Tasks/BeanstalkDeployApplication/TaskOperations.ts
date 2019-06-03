/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { debug, loc, setVariable } from 'vsts-task-lib'

import { ElasticBeanstalk, S3 } from 'aws-sdk/clients/all'
import { BeanstalkUtils } from 'Common/beanstalkUtils'
import { SdkUtils } from 'Common/sdkutils'
import { basename } from 'path'
import {
    applicationTypeAspNet,
    applicationTypeAspNetCoreForWindows,
    applicationTypeExistingVersion,
    TaskParameters
} from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly beanstalkClient: ElasticBeanstalk,
        public readonly s3Client: S3,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        await BeanstalkUtils.verifyApplicationExists(this.beanstalkClient, this.taskParameters.applicationName)
        await BeanstalkUtils.verifyEnvironmentExists(
            this.beanstalkClient,
            this.taskParameters.applicationName,
            this.taskParameters.environmentName
        )

        const versionLabel = BeanstalkUtils.constructVersionLabel(this.taskParameters.versionLabel)

        let s3Bucket: string
        let s3Key: string

        if (
            this.taskParameters.applicationType === applicationTypeAspNet ||
            this.taskParameters.applicationType === applicationTypeAspNetCoreForWindows
        ) {
            s3Bucket = await BeanstalkUtils.determineS3Bucket(this.beanstalkClient)
            let deploymentBundle: string
            if (this.taskParameters.applicationType === applicationTypeAspNetCoreForWindows) {
                const tempDirectory = SdkUtils.getTempLocation()
                deploymentBundle = await BeanstalkUtils.prepareAspNetCoreBundle(
                    this.taskParameters.dotnetPublishPath,
                    tempDirectory
                )
            } else {
                deploymentBundle = this.taskParameters.webDeploymentArchive
            }

            s3Key = `${this.taskParameters.applicationName}/${this.taskParameters.environmentName}/${basename(
                deploymentBundle,
                '.zip'
            )}-${versionLabel}.zip`

            await BeanstalkUtils.uploadBundle(this.s3Client, deploymentBundle, s3Bucket, s3Key)
        } else {
            s3Bucket = this.taskParameters.deploymentBundleBucket
            s3Key = this.taskParameters.deploymentBundleKey
        }

        const startingEventDate = await this.getLatestEventDate(
            this.taskParameters.applicationName,
            this.taskParameters.environmentName
        )

        await this.updateEnvironment(
            s3Bucket,
            s3Key,
            this.taskParameters.applicationName,
            this.taskParameters.environmentName,
            versionLabel,
            this.taskParameters.description,
            this.taskParameters.applicationType === applicationTypeExistingVersion
        )

        await this.waitForDeploymentCompletion(
            this.taskParameters.applicationName,
            this.taskParameters.environmentName,
            startingEventDate,
            this.taskParameters.eventPollingDelay
        )

        if (this.taskParameters.outputVariable) {
            console.log(loc('SettingOutputVariable', this.taskParameters.outputVariable, versionLabel))
            setVariable(this.taskParameters.outputVariable, versionLabel)
        }

        console.log(loc('TaskCompleted', this.taskParameters.applicationName))
    }

    private async updateEnvironment(
        bucketName: string,
        key: string,
        application: string,
        environment: string,
        versionLabel: string,
        description: string,
        isExistingVersion: boolean
    ): Promise<void> {
        if (!isExistingVersion) {
            const sourceBundle: ElasticBeanstalk.S3Location = {
                S3Bucket: bucketName,
                S3Key: key
            }

            const versionRequest: ElasticBeanstalk.CreateApplicationVersionMessage = {
                ApplicationName: application,
                VersionLabel: versionLabel,
                SourceBundle: sourceBundle,
                Description: description
            }

            await this.beanstalkClient.createApplicationVersion(versionRequest).promise()
            if (description) {
                console.log(
                    loc(
                        'CreatedApplicationVersionWithDescription',
                        versionRequest.VersionLabel,
                        description,
                        application
                    )
                )
            } else {
                console.log(loc('CreatedApplicationVersion', versionRequest.VersionLabel, application))
            }
        } else {
            console.log(loc('DeployingExistingVersion', versionLabel))
        }

        const request: ElasticBeanstalk.UpdateEnvironmentMessage = {
            ApplicationName: application,
            EnvironmentName: environment,
            VersionLabel: versionLabel
        }
        await this.beanstalkClient.updateEnvironment(request).promise()
        console.log(loc('StartingApplicationDeployment', request.VersionLabel))
    }

    private async waitForDeploymentCompletion(
        applicationName: string,
        environmentName: string,
        startingEventDate: Date,
        eventPollDelay: number
    ): Promise<void> {
        // upper limit to the random amount we add to the initial event poll start delay
        // and any extensions during event polling when throttling exhausts the sdk's
        // auto-retry ability
        const randomJitterUpperLimit: number = 5

        const requestEnvironment: ElasticBeanstalk.DescribeEnvironmentsMessage = {
            ApplicationName: applicationName,
            EnvironmentNames: [environmentName]
        }

        const requestEvents: ElasticBeanstalk.DescribeEventsMessage = {
            ApplicationName: applicationName,
            EnvironmentName: environmentName,
            StartTime: startingEventDate
        }

        let lastPrintedEventDate = startingEventDate

        console.log(loc('WaitingForDeployment'))
        console.log(loc('ConfiguredEventPollDelay', eventPollDelay))

        console.log(loc('EventsComing'))

        let success = true
        let environment: ElasticBeanstalk.EnvironmentDescription

        // delay the event poll by a random amount, up to 5 seconds, so that if multiple
        // deployments run in parallel they don't all start querying at the same time and
        // potentially trigger throttling from the outset
        const initialStartDelay = Math.floor(Math.random() * randomJitterUpperLimit) + 1
        await this.sleep(initialStartDelay * 1000)

        do {
            debug(`...event poll sleep for ${eventPollDelay}s`)
            await this.sleep(eventPollDelay * 1000)

            // if any throttling exception escapes the sdk's default retry logic,
            // extend the user's selected poll delay by a random, sub-5 second, amount
            try {
                const responseEnvironments = await this.beanstalkClient
                    .describeEnvironments(requestEnvironment)
                    .promise()
                if (responseEnvironments.Environments.length === 0) {
                    throw new Error(loc('FailedToFindEnvironment'))
                }
                environment = responseEnvironments.Environments[0]

                requestEvents.StartTime = lastPrintedEventDate
                const responseEvent = await this.beanstalkClient.describeEvents(requestEvents).promise()

                if (responseEvent.Events.length > 0) {
                    for (let i = responseEvent.Events.length - 1; i >= 0; i--) {
                        const event = responseEvent.Events[i]
                        if (event.EventDate <= lastPrintedEventDate) {
                            continue
                        }

                        console.log(`${event.EventDate}   ${event.Severity}   ${event.Message}`)

                        if (event.Message === 'Failed to deploy application.') {
                            success = false
                        }
                    }

                    lastPrintedEventDate = responseEvent.Events[0].EventDate
                }
            } catch (err) {
                // if we are still encountering throttles, increase the poll delay some more
                // tslint:disable-next-line: no-unsafe-any
                if (err.code === 'Throttling') {
                    eventPollDelay += Math.floor(Math.random() * randomJitterUpperLimit) + 1
                    console.log(loc('EventPollWaitExtended', eventPollDelay))
                } else {
                    throw err
                }
            }
        } while (environment.Status === 'Launching' || environment.Status === 'Updating')

        if (!success) {
            throw new Error(loc('FailedToDeploy'))
        }
    }

    private async getLatestEventDate(applicationName: string, environmentName: string): Promise<Date> {
        const requestEvents: ElasticBeanstalk.DescribeEventsMessage = {
            ApplicationName: applicationName,
            EnvironmentName: environmentName
        }

        const response = await this.beanstalkClient.describeEvents(requestEvents).promise()
        if (response.Events.length === 0) {
            return new Date()
        }

        return response.Events[0].EventDate
    }

    private async sleep(timeout: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, timeout)
        })
    }
}
