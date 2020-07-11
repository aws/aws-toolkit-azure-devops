/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ECR = require('aws-sdk/clients/ecr')
import tl = require('azure-pipelines-task-lib/task')
import { DockerHandler } from 'Common/dockerUtils'
import { constructTaggedImageName, getEcrAuthorizationData, loginToRegistry, logoutFromRegistry } from 'Common/ecrUtils'
import { parse } from 'url'
import { imageNameSource, TaskParameters } from './TaskParameters'

export class TaskOperations {
    private dockerPath: string = ''

    public constructor(
        public readonly ecrClient: ECR,
        public readonly dockerHandler: DockerHandler,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        this.dockerPath = await this.dockerHandler.locateDockerExecutable()

        let sourceImageRef: string

        if (this.taskParameters.forceDockerNamingConventions) {
            // The repository name can only contain lowercase letters, numbers, or - and _.
            this.taskParameters.repositoryName = this.taskParameters.repositoryName
                .toLowerCase()
                .replace(/[^a-z0-9-_.]/g, '')
        }

        if (this.taskParameters.imageSource === imageNameSource) {
            sourceImageRef = constructTaggedImageName(
                this.taskParameters.sourceImageName,
                this.taskParameters.sourceImageTag
            )
            console.log(tl.loc('PushImageWithName', sourceImageRef))
        } else {
            sourceImageRef = this.taskParameters.sourceImageId
            console.log(tl.loc('PushImageWithId', this.taskParameters.sourceImageId))
        }

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
            throw new Error(tl.loc('NoValidEndpoint', this.taskParameters.repositoryName))
        }
        if (authData.authorizationToken) {
            authToken = authData.authorizationToken
        }
        if (authData.proxyEndpoint) {
            proxyEndpoint = authData.proxyEndpoint
        }

        if (this.taskParameters.autoCreateRepository) {
            await this.createRepositoryIfNeeded(this.taskParameters.repositoryName)
        }

        const targetImageName = constructTaggedImageName(
            this.taskParameters.repositoryName,
            this.taskParameters.pushTag
        )
        const targetImageRef = `${endpoint}/${targetImageName}`
        await this.tagImage(sourceImageRef, targetImageRef)

        await loginToRegistry(this.dockerHandler, this.dockerPath, authToken, proxyEndpoint)

        await this.pushImageToECR(targetImageRef)

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable, targetImageRef))
            tl.setVariable(this.taskParameters.outputVariable, targetImageRef)
        }

        await logoutFromRegistry(this.dockerHandler, this.dockerPath, proxyEndpoint)

        console.log(tl.loc('TaskCompleted'))
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

    private async tagImage(sourceImageRef: string, imageTag: string): Promise<void> {
        console.log(tl.loc('AddingTag', imageTag, sourceImageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'tag', [sourceImageRef, imageTag])
    }

    private async pushImageToECR(imageRef: string): Promise<void> {
        console.log(tl.loc('PushingImage', imageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'push', [imageRef])
    }
}
