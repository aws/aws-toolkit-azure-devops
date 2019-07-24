/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as ECR from 'aws-sdk/clients/ecr'
import { DockerHandler } from 'Common/dockerUtils'
import { getEcrAuthorizationData, loginToRegistry } from 'Common/ecrUtils'
import { parse } from 'url'
import * as tl from 'vsts-task-lib/task'
import { imageTagSource, TaskParameters } from './TaskParameters'

export class TaskOperations {
    private dockerPath: string

    public constructor(
        public readonly ecrClient: ECR,
        public readonly dockerHandler: DockerHandler,
        public readonly taskParameters: TaskParameters
    ) {
        this.dockerPath = ''
    }

    public async execute(): Promise<void> {
        this.dockerPath = await this.dockerHandler.locateDockerExecutable()

        const authData = await getEcrAuthorizationData(this.ecrClient)
        if (!authData) {
            throw new Error(tl.loc('FailureToObtainAuthToken'))
        }

        let endpoint = ''
        let authToken = ''
        let proxyEndpoint = ''
        if (authData.proxyEndpoint) {
            endpoint = `${parse(authData.proxyEndpoint).host}`
        }
        if (!endpoint) {
            throw new Error(tl.loc('NoValidEndpoint', this.taskParameters.repository))
        }
        if (authData.authorizationToken) {
            authToken = authData.authorizationToken
        }
        if (authData.proxyEndpoint) {
            proxyEndpoint = authData.proxyEndpoint
        }

        let sourceImageRef: string
        if (this.taskParameters.imageSource === imageTagSource) {
            sourceImageRef = `${this.taskParameters.repository}:${this.taskParameters.imageTag}`
            console.log(tl.loc('PullImageWithTag', endpoint, sourceImageRef))
        } else {
            sourceImageRef = `${this.taskParameters.repository}@${this.taskParameters.imageDigest}`
            console.log(tl.loc('PullImageWithDigest', endpoint, sourceImageRef))
        }

        const targetImageRef = `${endpoint}/${sourceImageRef}`

        await loginToRegistry(this.dockerHandler, this.dockerPath, authToken, proxyEndpoint)
        await this.pullImageFromECR(targetImageRef)

        console.log(tl.loc('TaskCompleted'))
    }

    private async pullImageFromECR(imageRef: string): Promise<void> {
        console.log(tl.loc('PullingImage', imageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'pull', [imageRef])
    }
}
