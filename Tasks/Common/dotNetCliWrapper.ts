/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import tl = require('vsts-task-lib/task')
import tr = require('vsts-task-lib/toolrunner')

export class DotNetCliWrapper {
    public constructor(private readonly cwd: string, private readonly env: any) {}

    public async restoreAsync(): Promise<void> {
        return this.executeAsync(['restore'], '')
    }

    public async checkForGlobalLambdaToolsInstalled(): Promise<boolean> {
        try {
            await this.executeAsync(['lambda', '--help'], '')
        } catch (exception) {
            return false
        }

        return true
    }

    public async installGlobalToolsAsync(): Promise<boolean> {
        try {
            await this.executeAsync(['tool', 'install', '-g', 'Amazon.Lambda.Tools'], '')
        } catch (e) {
            // If something went wrong in the last step, we try to update the tools instead
            // This might succeed, but if it doesn't we just throw an exception
            try {
                await this.executeAsync(['tool', 'update', '-g', 'Amazon.Lambda.Tools'], '')
            } catch (e2) {
                return false
            }
        }

        return true
    }

    public async serverlessDeployAsync(
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

        return this.executeAsync(args, additionalArgs)
    }

    public async lambdaDeployAsync(
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

        return this.executeAsync(args, additionalArgs)
    }

    public async executeAsync(args: string[], additionalArgs: string): Promise<void> {
        const dotnetPath = tl.which('dotnet', true)
        console.log('Path to tool: ' + dotnetPath)

        const dotnet = tl.tool(dotnetPath)

        for (const arg of args) {
            dotnet.arg(arg)
        }

        dotnet.line(additionalArgs)

        const execOptions = {
            cwd: this.cwd,
            env: this.env
        }

        // tslint:disable-next-line: no-unsafe-any
        await dotnet.exec(execOptions as any)
    }
}
