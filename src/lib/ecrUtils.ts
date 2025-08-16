/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ECR = require('aws-sdk/clients/ecr')
import tl = require('azure-pipelines-task-lib/task')
import base64 = require('base-64')
import { DockerHandler } from './dockerUtils'

export async function loginToRegistry(
    dockerHandler: DockerHandler,
    dockerPath: string,
    encodedAuthToken: string,
    endpoint: string
): Promise<void> {
    const tokens: string[] = base64
        .decode(encodedAuthToken)
        .trim()
        .split(':')

    // Mask credentials from logs to prevent accidental exposure
    if (tokens[0]) {
        tl.setSecret(tokens[0]) // username
    }
    if (tokens[1]) {
        tl.setSecret(tokens[1]) // password
    }

    await dockerHandler.runDockerCommand(dockerPath, 'login', ['-u', tokens[0], '--password-stdin', endpoint], {
        silent: true,
        input: tokens[1] // Password provided via stdin
    })
}

export async function getEcrAuthorizationData(ecrClient: ECR): Promise<ECR.AuthorizationData | undefined> {
    try {
        console.log(tl.loc('RequestingAuthToken'))
        const response = await ecrClient.getAuthorizationToken().promise()

        if (!response.authorizationData) {
            return undefined
        }

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
