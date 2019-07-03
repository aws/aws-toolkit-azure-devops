/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('vsts-task-lib/task')

export class DotNetCliWrapper {
    private constructor(
        private readonly cwd: string,
        private readonly env: any,
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

        args.push('lambda')

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
        functionMemory: number,
        functionTimeout: number,
        packageOnly: boolean,
        packageOutputFile: string,
        additionalArgs: string
    ): Promise<number> {
        const args = Array<string>()

        args.push('lambda')

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

    public async execute(args: string[], additionalArgs: string, additionalCommandLineOptions?: any): Promise<number> {
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

    public async restore(): Promise<number> {
        return await this.execute(['restore'], '')
    }

    private async checkForGlobalLambdaToolsInstalled(): Promise<boolean> {
        try {
            const returnCode = await this.execute(['lambda', 'help'], '', { silent: true })
            if (returnCode !== 0) {
                return false
            }
        } catch (exception) {
            return false
        }

        return true
    }

    private async updateGlobalTools(): Promise<boolean> {
        try {
            const returnCode = await this.execute(['tool', 'update', '-g', 'Amazon.Lambda.Tools'], '')
            if (returnCode === 0) {
                return true
            } else {
                tl.error(tl.loc('LambdaToolsUpdateFailed', `${returnCode}`))
            }
        } catch (e) {
            tl.error(tl.loc('LambdaToolsUpdateFailed', `${e}`))

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
                tl.error(tl.loc('LambdaToolsInstallFailed', `${returnCode}`))
            }
        } catch (e) {
            tl.error(tl.loc('LambdaToolsInstallFailed', `${e}`))
        }

        // If install fails, try update as a last resort
        return await this.updateGlobalTools()
    }

    public static async buildDotNetCliWrapper(cwd: string, env: any, dotnetCliPath: string): Promise<DotNetCliWrapper> {
        const wrapper = new DotNetCliWrapper(cwd, env, dotnetCliPath)
        if (await wrapper.checkForGlobalLambdaToolsInstalled()) {
            // Try an update, if it fails that is fine
            if (!(await wrapper.updateGlobalTools())) {
                tl.error('Update of dotnet lambda tools failed, see the log for the error produced')
            }

            return wrapper
        }

        tl.debug(tl.loc('InstallingOrUpdatingLambdaTools'))
        if (!(await wrapper.installGlobalTools())) {
            // if checking for lambda tools fails and installing them fails, we are probably on the
            // wrong instance type because we were unable to install
            throw new Error(
                'Unable to install Amazon.Lambda.Tools! Are you using the correct hosted ' +
                    "agent type? Refer to Microsoft's guide for the correct hosted agent for .NET Core" +
                    'to make sure: https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted?' +
                    'view=azure-devops#use-a-microsoft-hosted-agent'
            )
        }

        return wrapper
    }
}
