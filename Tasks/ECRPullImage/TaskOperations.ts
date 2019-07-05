/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ECR = require('aws-sdk/clients/ecr')
import base64 = require('base-64')
import { DockerHandler } from 'Common/dockerUtils'
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
            sourceImageRef = this.constructTaggedImageName(
                this.taskParameters.sourceImageName,
                this.taskParameters.sourceImageTag
            )
            console.log(tl.loc('PullImageWithName', sourceImageRef))
        } else {
            sourceImageRef = this.taskParameters.sourceImageId
            console.log(tl.loc('PullImageWithId', this.taskParameters.sourceImageId))
        }

        const authData = await this.getEcrAuthorizationData()
        const endpoint = parse(authData.proxyEndpoint).host

        const targetImageName = this.constructTaggedImageName(
            this.taskParameters.repositoryName,
            this.taskParameters.pullTag
        )
        const targetImageRef = `${endpoint}/${targetImageName}`
        await this.tagImage(sourceImageRef, targetImageRef)

        await this.loginToRegistry(authData.authorizationToken, authData.proxyEndpoint)

        await this.pullImageFromECR(targetImageRef)

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable, targetImageRef))
            tl.setVariable(this.taskParameters.outputVariable, targetImageRef)
        }

        console.log(tl.loc('TaskCompleted'))
    }

    private constructTaggedImageName(imageName: string, tag: string): string {
        if (tag) {
            return `${imageName}:${tag}`
        }

        return imageName
    }

    private async createRepositoryIfNeeded(repository: string): Promise<void> {
        console.log(tl.loc('TestingForRepository', repository))

        try {
            await this.ecrClient
                .describeRepositories({
                    repositoryNames: [repository]
                })
                .promise()
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            if (err.code === 'RepositoryNotFoundException') {
                console.log(tl.loc('CreatingRepository'))
                await this.ecrClient
                    .createRepository({
                        repositoryName: repository
                    })
                    .promise()
            } else {
                throw new Error(`Error testing for repository existence: ${err}`)
            }
        }
    }

    private async loginToRegistry(encodedAuthToken: string, endpoint: string): Promise<void> {
        // tslint:disable-next-line: no-unsafe-any
        const tokens: string[] = base64
            .decode(encodedAuthToken)
            .trim()
            .split(':')
        await this.dockerHandler.runDockerCommand(
            this.dockerPath,
            'login',
            ['-u', tokens[0], '-p', tokens[1], endpoint],
            { silent: true }
        )
    }

    private async tagImage(sourceImageRef: string, imageTag: string): Promise<void> {
        console.log(tl.loc('AddingTag', imageTag, sourceImageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'tag', [sourceImageRef, imageTag])
    }

    private async pullImageFromECR(imageRef: string): Promise<void> {
        console.log(tl.loc('PullingImage', imageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'pull', [imageRef])
    }

    private async getEcrAuthorizationData(): Promise<ECR.AuthorizationData> {
        try {
            console.log(tl.loc('RequestingAuthToken'))
            const response = await this.ecrClient.getAuthorizationToken().promise()

            return response.authorizationData[0]
        } catch (err) {
            throw new Error(`Failed to obtain authorization token to log in to ECR, error: ${err}`)
        }
    }
}
