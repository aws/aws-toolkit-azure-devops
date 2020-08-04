/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as ECR from 'aws-sdk/clients/ecr'
import * as tl from 'azure-pipelines-task-lib/task'
import { DockerHandler } from 'Common/dockerUtils'
import { getEcrAuthorizationData, loginToRegistry, logoutFromRegistry } from 'Common/ecrUtils'
import { parse } from 'url'
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

        if (this.taskParameters.dockerLogin === false) {
        } else {
            await loginToRegistry(this.dockerHandler, this.dockerPath, authToken, proxyEndpoint)
        }

        await this.pullImageFromECR(targetImageRef)

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable, targetImageRef))
            tl.setVariable(this.taskParameters.outputVariable, targetImageRef)
        }

        if (this.taskParameters.dockerLogout === true && this.taskParameters.dockerLogin !== false) {
            await logoutFromRegistry(this.dockerHandler, this.dockerPath, proxyEndpoint)
        }

        console.log(tl.loc('TaskCompleted'))
    }

    private async pullImageFromECR(imageRef: string): Promise<void> {
        console.log(tl.loc('PullingImage', imageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'pull', [imageRef])
    }
}
