/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ncp = require('child_process')
import esbuild = require('esbuild')
import fs = require('fs-extra')
import path = require('path')
import folders = require('./scriptUtils')
import os = require('os')

const timeMessage = 'Packaged extension'
const manifestFile = 'vss-extension.json'

const ignoredFolders = ['Common', '.DS_Store']

const vstsFiles = ['task.json', 'task.loc.json', 'package.json', 'icon.png', 'Strings']

interface CommandLineOptions {
    publisher?: string
}

function findMatchingFiles(directory: string) {
    return fs.readdirSync(directory)
}

function installNodePackages(directory: string) {
    fs.mkdirpSync(directory)
    const npmCmd = `npm install --prefix ${directory} azure-pipelines-task-lib --only=production`
    try {
        const output = ncp.execSync(npmCmd)
        console.log(output.toString('utf8'))
    } catch (err) {
        console.error(err.output ? err.output.toString() : err?.message)
        process.exit(1)
    }
}

function generateGitHashFile() {
    try {
        const response = ncp.execSync('git rev-parse HEAD', { encoding: 'utf-8' }).toString()
        console.log(`Putting git hash ${response.trim()} into the package directory`)
        fs.outputFileSync(path.join(folders.packageRoot, '.gitcommit'), response.trim())
    } catch (e) {
        console.log(`Getting commit hash failed ${e}`)
        throw e
    }
}

function packagePlugin(options: CommandLineOptions) {
    fs.mkdirpSync(folders.packageRoot)
    fs.mkdirpSync(folders.packageTasks)
    const npmFolder = path.join(folders.buildRoot, 'npmcache')

    fs.copySync(path.join(folders.repoRoot, 'LICENSE'), path.join(folders.packageRoot, 'LICENSE'), { overwrite: true })
    fs.copySync(path.join(folders.repoRoot, 'README.md'), path.join(folders.packageRoot, 'README.md'), {
        overwrite: true
    })
    fs.copySync(path.join(folders.repoRoot, 'build', manifestFile), path.join(folders.packageRoot, manifestFile), {
        overwrite: true
    })

    generateGitHashFile()

    // stage manifest images
    fs.copySync(path.join(folders.repoRoot, 'images'), path.join(folders.packageRoot, 'images'), { overwrite: true })

    // get required npm packages that will be copied
    installNodePackages(npmFolder)

    // clean, dedupe and pack each task as needed
    findMatchingFiles(folders.sourceTasks).forEach(function(taskName) {
        console.log('Processing task ' + taskName)

        if (ignoredFolders.some(folderName => folderName === taskName)) {
            console.log('Skpping task ' + taskName)

            return
        }

        const taskBuildFolder = path.join(folders.buildTasks, taskName)
        const taskPackageFolder = path.join(folders.packageTasks, taskName)
        fs.mkdirpSync(taskPackageFolder)

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const taskDef = require(path.join(taskBuildFolder, 'task.json'))
        if (
            !Object.hasOwnProperty.call(taskDef.execution, 'Node') &&
            !Object.hasOwnProperty.call(taskDef.execution, 'Node10') &&
            !Object.hasOwnProperty.call(taskDef.execution, 'Node14')
        ) {
            console.log('Copying non-node task ' + taskName)
            fs.copySync(taskBuildFolder, taskPackageFolder)

            return
        }

        for (const resourceFile of vstsFiles) {
            fs.copySync(path.join(taskBuildFolder, resourceFile), path.join(taskPackageFolder, resourceFile), {
                overwrite: true
            })
        }
        // we also need lib.json from azure pipelines task lib or else localization will not work properly
        fs.copySync(
            path.join(folders.repoRoot, 'node_modules/azure-pipelines-task-lib/lib.json'),
            path.join(taskPackageFolder, 'lib.json'),
            { overwrite: true }
        )

        const inputFilename = path.join(taskBuildFolder, taskName + '.runner.js')

        console.log('packing node-based task')
        try {
            const result = esbuild.buildSync({
                entryPoints: [inputFilename],
                bundle: true,
                platform: 'node',
                target: ['node10', 'node16'],
                minify: true,
                outfile: `${taskPackageFolder}/${taskName}.js`
            })
            result.warnings.forEach(warning => console.log(warning))
        } catch (err) {
            console.error(err.output ? err.output.toString() : err.message)
            process.exit(1)
        }
    })

    console.log('Creating deployment vsix')

    const binName = os.platform() === 'win32' ? `tfx.cmd` : 'tfx'
    const tfx = path.join(process.cwd(), 'node_modules', '.bin', binName)
    const args: string[] = ['extension', 'create', '--root', folders.packageRoot]

    args.push('--output-path', folders.packageRoot)
    args.push('--manifests', path.join(folders.packageRoot, manifestFile))

    if (options.publisher) {
        args.push('--publisher', options.publisher)
    }

    console.log('Packaging with:' + `${tfx} ${args.join(' ')}`)

    ncp.execFileSync(tfx, args, { stdio: 'pipe', shell: true })

    console.log('Packaging successful')
}

console.time(timeMessage)
const commandLineInput = process.argv.slice(2) ?? ''
const parsedOptions: CommandLineOptions = {}
if (commandLineInput.length > 0 && commandLineInput[0].split('=')[0] === 'publisher') {
    parsedOptions.publisher = commandLineInput[0].split('=')[1]
}
packagePlugin(parsedOptions)
console.timeEnd(timeMessage)
