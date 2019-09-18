/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('azure-pipelines-task-lib/task')

export interface DockerHandler {
    locateDockerExecutable(): Promise<string>
    runDockerCommand(
        dockerPath: string,
        command: string,
        args: string[],
        additionalCommandLineOptions?: any
    ): Promise<void>
}

export async function locateDockerExecutable(): Promise<string> {
    const dockerExecutables: string[] = ['docker', 'docker.exe']

    let dockerPath = ''
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

export async function runDockerCommand(
    dockerPath: string,
    command: string,
    args: string[],
    additionalCommandLineOptions?: any
): Promise<void> {
    console.log(tl.loc('InvokingDockerCommand', dockerPath, command))

    const docker = tl.tool(dockerPath)
    docker.arg(command)

    for (const arg of args) {
        docker.arg(arg)
    }

    // tslint:disable-next-line: no-unsafe-any
    await docker.exec(additionalCommandLineOptions)
}
