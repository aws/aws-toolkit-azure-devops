/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getCredentials, getRegion } from 'Common/awsConnectionParameters'
import { SdkUtils } from 'Common/sdkutils'
import fs = require('fs')
import path = require('path')
import tl = require('vsts-task-lib/task')
import tr = require('vsts-task-lib/toolrunner')
import { inlineScriptType, TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(public readonly taskParameters: TaskParameters) {}

    // based on the VSTS 'ShellScript' task but modified to inject AWS credentials
    // and region into the environment, and to be able to specify the script inline
    // or from a file
    public async execute(): Promise<number> {
        let scriptPath = ''
        try {
            await this.configureAWSContext()
            await SdkUtils.configureHttpProxyFromAgentProxyConfiguration('AWSShellScript')

            const bash = tl.tool(tl.which('bash', true))

            if (this.taskParameters.scriptType === inlineScriptType) {
                const tempDir = SdkUtils.getTempLocation()
                const fileName = `awsshellscript_${process.pid}.sh`
                scriptPath = path.join(tempDir, fileName)
                fs.writeFileSync(scriptPath, this.taskParameters.inlineScript, { encoding: 'utf-8' })
            } else {
                scriptPath = this.taskParameters.filePath
            }

            let workingDirectory: string
            if (this.taskParameters.disableAutoCwd) {
                workingDirectory = this.taskParameters.workingDirectory
            } else {
                workingDirectory = process.env.SYSTEM_DEFAULTWORKINGDIRECTORY || path.dirname(scriptPath)
            }

            // The solution to this not working on windows comes from doing it like it's done in
            // the ms task: https://github.com/microsoft/azure-pipelines-tasks/blob/master/Tasks/BashV3/bash.ts
            // Thanks to the ms team opensourcing their tasks for the solution logic
            if (process.platform === 'win32') {
                scriptPath =
                    (await this.translateWindowsPath(path.dirname(scriptPath))) +
                    `${path.posix.sep}${path.basename(scriptPath)}`
            }

            tl.mkdirP(workingDirectory)

            bash.arg(scriptPath)

            if (this.taskParameters.arguments) {
                bash.line(this.taskParameters.arguments)
            }

            const execOptions = {
                cwd: workingDirectory,
                env: process.env,
                errStream: process.stdout,
                outStream: process.stdout,
                failOnStdErr: this.taskParameters.failOnStandardError
            }

            return await bash.exec((execOptions as unknown) as tr.IExecOptions)
        } finally {
            if (this.taskParameters.scriptType === inlineScriptType && scriptPath !== '' && tl.exist(scriptPath)) {
                fs.unlinkSync(scriptPath)
            }
        }
    }

    private async translateWindowsPath(windowsPath: string): Promise<string> {
        const pwd = tl
            .tool(tl.which('bash', true))
            .arg('--noprofile')
            .arg('--norc')
            .arg('-c')
            .arg('pwd')

        const options = {
            cwd: windowsPath,
            errStream: process.stdout,
            outStream: process.stdout,
            failOnStdErr: true,
            ignoreReturnCode: false
        }
        let unixPath = ''
        // tslint:disable-next-line: no-unsafe-any
        pwd.on('stdout', c => (unixPath += c.toString()))
        await pwd.exec((options as unknown) as tr.IExecOptions)
        unixPath = unixPath.trim()

        if (!unixPath) {
            throw new Error(tl.loc('BashUnableToFindScript', windowsPath))
        }

        return unixPath
    }

    // If assume role credentials are in play, make sure the initial generation
    // of temporary credentials has been performed. If no credentials and/or
    // region were defined then we assume they are already set in the host
    // environment. Environment variables are preferred over stored profiles
    // as this isolates parallel builds and avoids content left lying around on
    // the agent when a build completes
    private async configureAWSContext() {
        const env = process.env

        const credentials = await getCredentials(this.taskParameters.awsConnectionParameters)
        if (credentials) {
            await credentials.getPromise()
            tl.debug('configure credentials into environment variables')
            env.AWS_ACCESS_KEY_ID = credentials.accessKeyId
            env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey
            if (credentials.sessionToken) {
                env.AWS_SESSION_TOKEN = credentials.sessionToken
            }
        }

        const region = await getRegion()
        if (region) {
            tl.debug('configure region into environment variable')
            env.AWS_REGION = region
            // set for the benefit of any aws cli commands the user might
            // exec as part of the script
            env.AWS_DEFAULT_REGION = region
        }
    }
}
