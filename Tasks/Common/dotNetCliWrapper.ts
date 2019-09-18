/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('azure-pipelines-task-lib/task')

import { ToolRunner } from 'azure-pipelines-task-lib/toolrunner'
import * as fs from 'fs'
import * as path from 'path'

export class DotNetCliWrapper {
    private constructor(
        private readonly cwd: string,
        private readonly env: any,
        private readonly dotnetCliPath: string
    ) {}

    public async restore(): Promise<number> {
        return await this.execute(['restore'], '')
    }

    private async execute(args: string[], additionalArgs: string, additionalCommandLineOptions?: any): Promise<number> {
        const dotnet = tl.tool(this.dotnetCliPath)

        for (const arg of args) {
            dotnet.arg(arg)
        }

        dotnet.line(additionalArgs)

        const execOptions: any = {
            cwd: this.cwd,
            env: this.env
        }

        if (additionalCommandLineOptions) {
            // tslint:disable-next-line: no-unsafe-any
            for (const key of Object.keys(additionalCommandLineOptions)) {
                // tslint:disable-next-line: no-unsafe-any
                execOptions.key = additionalCommandLineOptions[key]
            }
        }

        // tslint:disable-next-line: no-unsafe-any
        return await dotnet.exec(execOptions)
    }

    private async updateGlobalTools(): Promise<boolean> {
        try {
            const returnCode = await this.execute(['tool', 'update', '-g', 'Amazon.Lambda.Tools'], '')
            if (returnCode === 0) {
                return true
            } else {
                tl.debug(tl.loc('LambdaToolsUpdateFailed', `${returnCode}`))
            }
        } catch (e) {
            tl.debug(tl.loc('LambdaToolsUpdateFailed', `${e}`))

            return false
        }

        return false
    }

    private async installGlobalTools(): Promise<boolean> {
        try {
            const returnCode = await this.execute(['tool', 'install', '-g', 'Amazon.Lambda.Tools'], '')
            if (returnCode === 0) {
                return true
            } else {
                tl.debug(tl.loc('LambdaToolsInstallFailed', `${returnCode}`))
            }
        } catch (e) {
            tl.debug(tl.loc('LambdaToolsInstallFailed', `${e}`))
        }

        // If install fails, try update
        return await this.updateGlobalTools()
    }

    public static async buildDotNetCliWrapper(cwd: string, env: any, dotnetCliPath: string): Promise<DotNetCliWrapper> {
        const wrapper = new DotNetCliWrapper(cwd, env, dotnetCliPath)

        tl.debug(tl.loc('InstallingOrUpdatingLambdaTools'))
        if (!(await wrapper.installGlobalTools())) {
            // if checking for lambda tools fails and installing them fails, we are probably on the
            // wrong instance type because we were unable to install. This is fine, we might be able to
            // use the old tools
            tl.error(
                'Unable to install global Amazon.Lambda.Tools! The old package based version of Amazon.Lambda.Tools ' +
                    'is now deprecated. Newer .NET core versions will need to use a newer hosted agent and the ' +
                    "global tools (which this task auto installs). Refer to Microsoft's guide for the correct hosted " +
                    'agent for which hosted agent you need to use newer .NET Core versions:' +
                    'https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted'
            )
        }

        return wrapper
    }
}

export class DotNetLambdaWrapper {
    private constructor(
        private readonly cwd: string,
        private readonly env: any,
        private readonly lambdaDotnetTool: string,
        private readonly dotnetCliPath: string
    ) {}
    public async serverlessDeploy(
        awsRegion: string,
        stackName: string,
        s3Bucket: string,
        s3Prefix: string,
        packageOnly: boolean,
        packageOutputFile: string,
        additionalArgs: string
    ): Promise<number> {
        const args = Array<string>()

        if (packageOnly) {
            console.log(tl.loc('CreatingServerlessPackageOnly', packageOutputFile))

            args.push('package-ci')
            args.push('-ot')
            args.push(packageOutputFile)
        } else {
            args.push('deploy-serverless')

            if (stackName) {
                args.push('--stack-name')
                args.push(stackName)
            }
        }

        if (awsRegion) {
            args.push('--region')
            args.push(awsRegion)
        }
        if (s3Bucket) {
            args.push('--s3-bucket')
            args.push(s3Bucket)
        }
        if (s3Prefix) {
            args.push('--s3-prefix')
            args.push(s3Prefix)
        }

        args.push('--disable-interactive')
        args.push('true')

        return await this.execute(args, additionalArgs)
    }

    public async lambdaDeploy(
        awsRegion: string,
        functionName: string,
        functionHandler: string,
        functionRole: string,
        functionMemory: number | undefined,
        functionTimeout: number | undefined,
        packageOnly: boolean,
        packageOutputFile: string,
        additionalArgs: string
    ): Promise<number> {
        const args = Array<string>()

        if (packageOnly) {
            args.push('package')
            console.log(tl.loc('CreatingFunctionPackageOnly', packageOutputFile))
            args.push('-o')
            args.push(packageOutputFile)
        } else {
            args.push('deploy-function')
        }

        if (awsRegion) {
            args.push('--region')
            args.push(awsRegion)
        }
        if (functionName) {
            args.push('-fn')
            args.push(functionName)
        }
        if (functionHandler) {
            args.push('-fh')
            args.push(functionHandler)
        }
        if (functionRole) {
            args.push('--function-role')
            args.push(functionRole)
        }
        if (functionMemory) {
            args.push('--function-memory-size')
            args.push(functionMemory.toString())
        }
        if (functionTimeout) {
            args.push('--function-timeout')
            args.push(functionTimeout.toString())
        }

        args.push('--disable-interactive')
        args.push('true')

        return await this.execute(args, additionalArgs)
    }

    private getLambdaToolPath(): string {
        const dotnetPath = path.join('~', '.dotnet', 'tools')

        let lambdaPath = ''
        try {
            lambdaPath = tl.which(this.lambdaDotnetTool, true)

            return lambdaPath
        } catch (e) {}
        lambdaPath = path.join(dotnetPath, `${this.lambdaDotnetTool}.exe`)
        try {
            fs.accessSync(lambdaPath)

            return lambdaPath
        } catch (e) {}
        lambdaPath = path.join(dotnetPath, this.lambdaDotnetTool)
        try {
            fs.accessSync(lambdaPath)

            return lambdaPath
        } catch (e) {}

        tl.debug(tl.loc('LambdaToolsPathNotFound'))

        return ''
    }

    private async execute(args: string[], additionalArgs: string, additionalCommandLineOptions?: any): Promise<number> {
        const toolPath = this.getLambdaToolPath()
        let dotnet: ToolRunner
        if (toolPath) {
            dotnet = tl.tool(toolPath)
        } else {
            // else support legacy method
            dotnet = tl.tool(this.dotnetCliPath)
            dotnet.arg('lambda')
        }

        for (const arg of args) {
            dotnet.arg(arg)
        }

        if (additionalArgs) {
            dotnet.line(additionalArgs)
        }

        const execOptions: any = {
            cwd: this.cwd,
            env: this.env
        }

        if (additionalCommandLineOptions) {
            // tslint:disable-next-line: no-unsafe-any
            for (const key of Object.keys(additionalCommandLineOptions)) {
                // tslint:disable-next-line: no-unsafe-any
                execOptions.key = additionalCommandLineOptions[key]
            }
        }

        // tslint:disable-next-line: no-unsafe-any
        return await dotnet.exec(execOptions)
    }

    public static async buildDotNetLambdaWrapper(
        cwd: string,
        env: any,
        dotnetTool: string,
        dotnetCliPath: string
    ): Promise<DotNetLambdaWrapper> {
        return new DotNetLambdaWrapper(cwd, env, dotnetTool, dotnetCliPath)
    }
}
