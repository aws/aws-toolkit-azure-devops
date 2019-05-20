/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib')
import { AWSTaskParametersBase } from 'sdkutils/awsTaskParametersBase'

export class TaskParameters extends AWSTaskParametersBase {
    // options for applicationType
    public static readonly applicationTypeAspNet: string = 'aspnet'
    public static readonly applicationTypeAspNetCoreForWindows: string = 'aspnetCoreWindows'

    public static readonly applicationTypeS3Archive: string = 's3'
    public static readonly applicationTypeExistingVersion: string = 'version'

    public static readonly defaultEventPollingDelay: number = 5 // seconds
    public static readonly maxEventPollingDelay: number = 300 // seconds, 5 mins

    public applicationName: string
    public environmentName: string
    public applicationType: string
    public webDeploymentArchive: string
    public dotnetPublishPath: string
    public versionLabel: string
    public deploymentBundleBucket: string
    public deploymentBundleKey: string
    public description: string

    public outputVariable: string
    public eventPollingDelay: number = TaskParameters.defaultEventPollingDelay

    constructor() {
        super()
        try {
            this.applicationType = tl.getInput('applicationType', true)
            console.log(tl.loc('DisplayApplicationType', this.applicationType))

            switch (this.applicationType) {
                case TaskParameters.applicationTypeAspNet:
                    {
                        this.webDeploymentArchive = tl.getPathInput('webDeploymentArchive', true)
                    }
                    break

                case TaskParameters.applicationTypeAspNetCoreForWindows:
                    {
                        this.dotnetPublishPath = tl.getPathInput('dotnetPublishPath', true)
                    }
                    break

                case TaskParameters.applicationTypeS3Archive:
                    {
                        this.deploymentBundleBucket = tl.getInput('deploymentBundleBucket', true)
                        this.deploymentBundleKey = tl.getInput('deploymentBundleKey', true)
                    }
                    break

                default:
                    // version label read below
                    break
            }

            this.applicationName = tl.getInput('applicationName', true)
            this.environmentName = tl.getInput('environmentName', true)
            this.versionLabel = tl.getInput(
                'versionLabel',
                this.applicationType === TaskParameters.applicationTypeExistingVersion
            )
            this.description = tl.getInput('description', false)
            this.outputVariable = tl.getInput('outputVariable', false)
            const pollDelay = tl.getInput('eventPollingDelay', false)
            if (pollDelay) {
                try {
                    const pollDelayValue = parseInt(pollDelay, 10)
                    if (
                        pollDelayValue >= TaskParameters.defaultEventPollingDelay &&
                        pollDelayValue <= TaskParameters.maxEventPollingDelay
                    ) {
                        this.eventPollingDelay = pollDelayValue
                    } else {
                        throw new Error()
                    }
                } catch {
                    console.log(
                        tl.loc(
                            'InvalidEventPollDelay',
                            pollDelay,
                            TaskParameters.defaultEventPollingDelay,
                            TaskParameters.maxEventPollingDelay
                        )
                    )
                }
            }
        } catch (error) {
            throw new Error(error.message)
        }
    }
}
