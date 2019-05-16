/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import ECR = require('aws-sdk/clients/ecr')
import base64 = require('base-64')
import { parse } from 'url'
import tl = require('vsts-task-lib/task')
import { imageNameSource, TaskParameters } from './TaskParameters'

export class TaskOperations {

    private dockerPath: string

    public constructor(
        public readonly ecrClient: ECR,
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        this.dockerPath = await this.locateDockerExecutable()

        let sourceImageRef: string
        if (this.taskParameters.imageSource === imageNameSource) {
            sourceImageRef = this
                .constructTaggedImageName(this.taskParameters.sourceImageName, this.taskParameters.sourceImageTag)
            console.log(tl.loc('PushImageWithName', sourceImageRef))
        } else {
            sourceImageRef = this.taskParameters.sourceImageId
            console.log(tl.loc('PushImageWithId', this.taskParameters.sourceImageId))
        }

        const authData = await this.getEcrAuthorizationData()
        const endpoint = parse(authData.proxyEndpoint).host

        if (this.taskParameters.autoCreateRepository) {
            await this.createRepositoryIfNeeded(this.taskParameters.repositoryName)
        }

        const targetImageName = this
            .constructTaggedImageName(this.taskParameters.repositoryName, this.taskParameters.pushTag)
        const targetImageRef = `${endpoint}/${targetImageName}`
        await this.tagImage(sourceImageRef, targetImageRef)

        await this.loginToRegistry(authData.authorizationToken, authData.proxyEndpoint)

        await this.pushImageToECR(targetImageRef)

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
            await this.ecrClient.describeRepositories({
                repositoryNames: [ repository ]
            }).promise()
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            if (err.code === 'RepositoryNotFoundException') {
                console.log(tl.loc('CreatingRepository'))
                await this.ecrClient.createRepository({
                    repositoryName: repository
                }).promise()
            } else {
                throw new Error(`Error testing for repository existence: ${err}`)
            }
        }
    }

    private async loginToRegistry(encodedAuthToken: string, endpoint: string): Promise<void> {
        // tslint:disable-next-line: no-unsafe-any
        const tokens: string[] = (base64.decode(encodedAuthToken)).trim().split(':')
        await this.runDockerCommand('login', ['-u', tokens[0], '-p', tokens[1], endpoint])
    }

    private async tagImage(sourceImageRef: string, imageTag: string): Promise<void> {
        console.log(tl.loc('AddingTag', imageTag, sourceImageRef))
        await this.runDockerCommand('tag', [ sourceImageRef, imageTag])
    }

    private async pushImageToECR(imageRef: string): Promise<void> {
        console.log(tl.loc('PushingImage', imageRef))
        await this.runDockerCommand('push', [ imageRef ])
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

    private async runDockerCommand(command: string, args: string[]): Promise<void> {
        console.log(tl.loc('InvokingDockerCommand', this.dockerPath, command))

        const docker = tl.tool(this.dockerPath)
        docker.arg(command)

        for (const arg of args) {
            docker.arg(arg)
        }

        // tslint:disable-next-line: no-unsafe-any
        await docker.exec()
    }

    private async locateDockerExecutable(): Promise<string> {
        const dockerExecutables: string[] = [
            'docker',
            'docker.exe'
        ]

        let dockerPath: string
        for (const e of dockerExecutables) {
            try {
                dockerPath = tl.which(e, true)
                if (dockerPath) {
                    break
                }
            // tslint:disable-next-line:no-empty
            } catch (err) {}
        }
        if (!dockerPath) {
            throw new Error('Cannot find docker command line executable')
        }

        return dockerPath
    }
}
