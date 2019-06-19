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
    ): Promise<void> {
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

        return this.execute(args, additionalArgs)
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
    ): Promise<void> {
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

        return this.execute(args, additionalArgs)
    }

    public async execute(args: string[], additionalArgs: string, additionalCommandLineOptions?: any): Promise<void> {
        const dotnet = tl.tool(this.dotnetCliPath)

        for (const arg of args) {
            dotnet.arg(arg)
        }

        dotnet.line(additionalArgs)

        const execOptions: any = {
            cwd: this.cwd,
            env: this.env,
            silent: false
        }

        if (additionalCommandLineOptions) {
            // tslint:disable-next-line: no-unsafe-any
            for (const key of Object.keys(additionalCommandLineOptions)) {
                // tslint:disable-next-line: no-unsafe-any
                execOptions.key = additionalCommandLineOptions[key]
            }
        }

        // tslint:disable-next-line: no-unsafe-any
        await dotnet.exec(execOptions)
    }

    private async restore(): Promise<void> {
        return this.execute(['restore'], '')
    }

    private async checkForGlobalLambdaToolsInstalled(): Promise<boolean> {
        try {
            await this.execute(['lambda', 'help'], '', { silent: true, failOnStdErr: true })
        } catch (exception) {
            tl.debug(`${exception}`)

            return false
        }

        return true
    }

    private async installGlobalTools(): Promise<boolean> {
        try {
            await this.execute(['tool', 'install', '-g', 'Amazon.Lambda.Tools'], '')
        } catch (e) {
            // If something went wrong in the last step, we try to update the tools instead
            // This might succeed, but if it doesn't we just throw an exception
            try {
                await this.execute(['tool', 'update', '-g', 'Amazon.Lambda.Tools'], '')
            } catch (e2) {
                return false
            }
        }

        return false
    }

    public static async buildDotNetCliWrapper(cwd: string, env: any, dotnetCliPath: string): Promise<DotNetCliWrapper> {
        const wrapper = new DotNetCliWrapper(cwd, env, dotnetCliPath)
        tl.debug(tl.loc('StartingDotNetRestore'))
        // Restore, this will install the lambda cli if it's < version 3
        await wrapper.restore()
        if (wrapper.checkForGlobalLambdaToolsInstalled()) {
            return wrapper
        }

        if (!(await wrapper.installGlobalTools())) {
            // if checking for lambda tools fails and installing them fails, we are probably on the
            // wrong instance type because we were unable to install
            throw new Error(
                'Unable to install Amazon.Lambda.Tools! Are you using the correct hosted ' +
                    "agent type? Refer to Microsoft's guide for the correct hosted agent for .NET Core" +
                    'to make sure: https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted? ' +
                    'view=azure-devops#use-a-microsoft-hosted-agent'
            )
        }

        return wrapper
    }
}
