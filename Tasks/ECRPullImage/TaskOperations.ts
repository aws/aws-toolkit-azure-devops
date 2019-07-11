/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ECR = require('aws-sdk/clients/ecr')
import { DockerHandler } from 'Common/dockerUtils'
import { constructTaggedImageName, getEcrAuthorizationData, loginToRegistry } from 'Common/ecrUtils'
import { parse } from 'url'
import tl = require('vsts-task-lib/task')
import { imageTagSource, TaskParameters } from './TaskParameters'

export class TaskOperations {
    private dockerPath: string

    public constructor(
        public readonly ecrClient: ECR,
        public readonly dockerHandler: DockerHandler,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        this.dockerPath = await this.dockerHandler.locateDockerExecutable()

        const authData = await getEcrAuthorizationData(this.ecrClient)
        const endpoint = parse(authData.proxyEndpoint).host

        let sourceImageRef: string
        if (this.taskParameters.imageSource === imageTagSource) {
            sourceImageRef = `${this.taskParameters.repositoryName}:${this.taskParameters.targetImageTag}`
            console.log(tl.loc('PullImageWithTag', endpoint, sourceImageRef))
        } else {
            sourceImageRef = `${this.taskParameters.repositoryName}@${this.taskParameters.targetImageDigest}`
            console.log(tl.loc('PullImageWithDigest', endpoint, sourceImageRef))
        }

        const targetImageRef = `${endpoint}/${sourceImageRef}`

        await loginToRegistry(this.dockerHandler, this.dockerPath, authData.authorizationToken, authData.proxyEndpoint)
        await this.pullImageFromECR(targetImageRef)

        console.log(tl.loc('TaskCompleted'))
    }

    private async pullImageFromECR(imageRef: string): Promise<void> {
        console.log(tl.loc('PullingImage', imageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'pull', [imageRef])
    }
}
