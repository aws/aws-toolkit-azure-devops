/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getCredentials, getRegion } from 'Common/awsConnectionParameters'
import { DotNetCliWrapper } from 'Common/dotNetCliWrapper'
import { SdkUtils } from 'Common/sdkutils'
import fs = require('fs')
import path = require('path')
import tl = require('vsts-task-lib/task')
import { TaskParameters } from './TaskParameters'

export class TaskOperations {
    public constructor(public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        const cwd = this.determineProjectDirectory(this.taskParameters.lambdaProjectPath)
        console.log(tl.loc('DeployingProjectAt', cwd))

        const defaultsFilePath: string = path.join(cwd, 'aws-lambda-tools-defaults.json')

        if (fs.existsSync(defaultsFilePath)) {
            console.log(tl.loc('ReadingDefaultSettingsFile'))
            let content = fs.readFileSync(defaultsFilePath, 'utf8')
            const json = JSON.parse(content)
            // tslint:disable: no-unsafe-any
            if (json.profile) {
                console.log(tl.loc('ClearingProfileCredentials', json.profile))
                json.profile = ''
                content = JSON.stringify(json)
                fs.writeFileSync(defaultsFilePath, content)
            }
            // tslint:enable: no-unsafe-any
        }

        const env = process.env

        // If assume role credentials are in play, make sure the initial generation
        // of temporary credentials has been performed. If no credentials were defined
        // for the task, we assume they are already set in the host environment.
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

        await SdkUtils.configureHttpProxyFromAgentProxyConfiguration('LambdaNETCoreDeploy')

        const wrapper = new DotNetCliWrapper(cwd, env)

        console.log(tl.loc('StartingDotNetRestore'))
        await wrapper.restore()
        if (!wrapper.checkForGlobalLambdaToolsInstalled() && !(await wrapper.installGlobalTools())) {
            throw new Error(
                'Unable to install Amazon.Lambda.Tools! Are you using the correct hosted ' +
                    "agent type? Refer to Microsoft's guide for the correct hoested agent for .NET Core" +
                    'to make sure: https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted? ' +
                    'view=azure-devops#use-a-microsoft-hosted-agent'
            )
        }

        switch (this.taskParameters.command) {
            case 'deployFunction':
                console.log(tl.loc('StartingFunctionDeployment'))
                await wrapper.lambdaDeploy(
                    region,
                    this.taskParameters.functionName,
                    this.taskParameters.functionHandler,
                    this.taskParameters.functionRole,
                    this.taskParameters.functionMemory,
                    this.taskParameters.functionTimeout,
                    this.taskParameters.packageOnly,
                    this.taskParameters.packageOutputFile,
                    this.taskParameters.additionalArgs
                )
                break
            case 'deployServerless':
                console.log(tl.loc('StartingServerlessDeployment'))
                await wrapper.serverlessDeploy(
                    region,
                    this.taskParameters.stackName,
                    this.taskParameters.s3Bucket,
                    this.taskParameters.s3Prefix,
                    this.taskParameters.packageOnly,
                    this.taskParameters.packageOutputFile,
                    this.taskParameters.additionalArgs
                )
                break

            default:
                throw new Error(tl.loc('UnknownDeploymentTypeError', this.taskParameters.command))
        }

        if (this.taskParameters.packageOnly) {
            console.log(tl.loc('PackageOnlyTaskCompleted'))
        } else {
            console.log(tl.loc('PackageAndDeployTaskCompleted'))
        }
    }

    private determineProjectDirectory(specifedLambdaProject: string): string {
        // should have already verified existence when reading parameters, but defense in
        // depth
        if (!fs.existsSync(specifedLambdaProject)) {
            throw new Error(tl.loc('ProjectPathOrFileDoesNotExist', specifedLambdaProject))
        }

        if (fs.statSync(specifedLambdaProject).isDirectory()) {
            return specifedLambdaProject
        }

        return path.dirname(specifedLambdaProject)
    }
}
