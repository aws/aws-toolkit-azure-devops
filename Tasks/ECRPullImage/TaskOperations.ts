/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ECR = require('aws-sdk/clients/ecr')
import { DockerHandler } from 'Common/dockerUtils'
import { constructTaggedImageName, getEcrAuthorizationData, loginToRegistry } from 'Common/ecrUtils'
import { parse } from 'url'
import tl = require('vsts-task-lib/task')
import { imageNameSource, TaskParameters } from './TaskParameters'

export class TaskOperations {
    private dockerPath: string

    public constructor(
        public readonly ecrClient: ECR,
        public readonly dockerHandler: DockerHandler,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        this.dockerPath = await this.dockerHandler.locateDockerExecutable()

        let sourceImageRef: string
        if (this.taskParameters.imageSource === imageNameSource) {
            sourceImageRef = constructTaggedImageName(
                this.taskParameters.targetImageName,
                this.taskParameters.targetImageTag
            )
            console.log(tl.loc('PullImageWithName', sourceImageRef))
        } else {
            sourceImageRef = this.taskParameters.targetImageId
            console.log(tl.loc('PullImageWithId', this.taskParameters.targetImageId))
        }

        const authData = await getEcrAuthorizationData(this.ecrClient)
        const endpoint = parse(authData.proxyEndpoint).host

        const targetImageRef = `${endpoint}/${sourceImageRef}`

        await loginToRegistry(this.dockerHandler, this.dockerPath, authData.authorizationToken, authData.proxyEndpoint)
        await this.pullImageFromECR(targetImageRef)

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable, targetImageRef))
            tl.setVariable(this.taskParameters.outputVariable, targetImageRef)
        }

        console.log(tl.loc('TaskCompleted'))
    }

    private async pullImageFromECR(imageRef: string): Promise<void> {
        console.log(tl.loc('PullingImage', imageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'pull', [imageRef])
    }
}
