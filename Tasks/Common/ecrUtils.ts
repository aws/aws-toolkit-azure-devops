/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ECR = require('aws-sdk/clients/ecr')
import base64 = require('base-64')
import tl = require('vsts-task-lib/task')
import { DockerHandler } from './dockerUtils'

export async function loginToRegistry(
    dockerHandler: DockerHandler,
    dockerPath: string,
    encodedAuthToken: string,
    endpoint: string
): Promise<void> {
    // tslint:disable-next-line: no-unsafe-any
    const tokens: string[] = base64
        .decode(encodedAuthToken)
        .trim()
        .split(':')
    await dockerHandler.runDockerCommand(dockerPath, 'login', ['-u', tokens[0], '-p', tokens[1], endpoint], {
        silent: true
    })
}

export async function getEcrAuthorizationData(ecrClient: ECR): Promise<ECR.AuthorizationData> {
    try {
        console.log(tl.loc('RequestingAuthToken'))
        const response = await ecrClient.getAuthorizationToken().promise()

        return response.authorizationData[0]
    } catch (err) {
        throw new Error(`Failed to obtain authorization token to log in to ECR, error: ${err}`)
    }
}

export function constructTaggedImageName(imageName: string, tag: string): string {
    if (tag) {
        return `${imageName}:${tag}`
    }

    return imageName
}
