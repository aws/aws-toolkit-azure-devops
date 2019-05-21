/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getCredentials, getRegion } from 'Common/awsConnectionParameters'
import fs = require('fs')
import path = require('path')
import { SdkUtils } from 'sdkutils/sdkutils'
import tl = require('vsts-task-lib/task')
import tr = require('vsts-task-lib/toolrunner')
import { inlineScriptType, TaskParameters } from './TaskParameters'

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {}

    // based on the VSTS 'ShellScript' task but modified to inject AWS credentials
    // and region into the environment, and to be able to specify the script inline
    // or from a file
    public async execute(): Promise<number> {

        let scriptPath: string
        try {
            await this.configureAWSContext()
            await SdkUtils.configureHttpProxyFromAgentProxyConfiguration('AWSShellScript')

            const bash = tl.tool(tl.which('bash', true))

            if (this.taskParameters.scriptType === inlineScriptType) {
                const tempDir = SdkUtils.getTempLocation()
                const fileName = `awsshellscript_${process.pid}.sh'`
                scriptPath = path.join(tempDir, fileName)
                tl.writeFile(scriptPath, this.taskParameters.inlineScript)
            } else {
                scriptPath = this.taskParameters.filePath
            }

            let cwd = this.taskParameters.cwd
            if (!cwd && !this.taskParameters.disableAutoCwd) {
                cwd = path.dirname(scriptPath)
            }

            tl.mkdirP(cwd)
            tl.cd(cwd)

            bash.arg(scriptPath)

            if (this.taskParameters.arguments) {
                bash.line(this.taskParameters.arguments)
            }

            const execOptions = {
                env: process.env,
                failOnStdErr: this.taskParameters.failOnStandardError
            }

            // tslint:disable-next-line: no-unsafe-any
            return await bash.exec(execOptions as tr.IExecOptions) 
        } finally {
            if (this.taskParameters.scriptType === inlineScriptType
                && scriptPath
                && tl.exist(scriptPath)) {
                fs.unlinkSync(scriptPath)
            }
        }
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
