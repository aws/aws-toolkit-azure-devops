/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ECR = require('aws-sdk/clients/ecr')
import tl = require('azure-pipelines-task-lib/task')
import { DockerHandler } from 'lib/dockerUtils'
import { constructTaggedImageName, getEcrAuthorizationData, loginToRegistry } from 'lib/ecrUtils'
import { parse } from 'url'
import { imageNameSource, retagSource, TaskParameters } from './TaskParameters'

export class TaskOperations {
    private dockerPath = ''

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

        const targetRepositoryName = this.taskParameters.repositoryName
        const targetImageName = constructTaggedImageName(
            this.taskParameters.repositoryName,
            this.taskParameters.targetTag
        )
        const targetImageRef = `${endpoint}/${targetImageName}`
        
        // Retag an image without pushing the complete image from docker.
        if (this.taskParameters.imageSource === retagSource) {
            const images = (await this.ecrClient.batchGetImage({
                repositoryName: targetRepositoryName,
                imageIds: [{imageTag: this.taskParameters.targetTag}]
            }).promise()).images

            if (!images || !images[0]) {
                throw new Error(tl.loc('FailureToFindExistingImage', this.taskParameters.targetTag, this.taskParameters.repositoryName))
            }

            const manifest = images[0].imageManifest
            if (manifest) {
                try {
                    await this.ecrClient.putImage({
                        imageTag: this.taskParameters.newTag,
                        repositoryName: targetRepositoryName,
                        imageManifest: manifest
                    }).promise()
                } catch (err: any) {
                    if (err.code !== 'ImageAlreadyExistsException') {
                        // Thrown when manifest and tag already exist in ECR.
                        // Do not block if the tag already exists on the target image.
                        throw err
                    }
                    console.log(err.message)
                }
            } else {
                throw new Error('batchGetImage did not return an image manifest.')
            }
        } else {
            if (this.taskParameters.autoCreateRepository) {
                await this.createRepositoryIfNeeded(this.taskParameters.repositoryName)
            }
    
            await this.tagImage(sourceImageRef, targetImageRef)
    
            await loginToRegistry(this.dockerHandler, this.dockerPath, authToken, proxyEndpoint)
    
            await this.pushImageToECR(targetImageRef)

            if (this.taskParameters.removeDockerImage) {
                await this.removeDockerImage(sourceImageRef)
            }
        }

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable, targetImageRef))
            tl.setVariable(this.taskParameters.outputVariable, targetImageRef)
        }

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
        } catch (err: any) {
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

    private async removeDockerImage(imageRef: string): Promise<void> {
        console.log(tl.loc('RemovingImage', imageRef))
        await this.dockerHandler.runDockerCommand(this.dockerPath, 'rmi', [imageRef], '-f')
    }
}
