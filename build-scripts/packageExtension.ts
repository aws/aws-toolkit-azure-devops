/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import ncp = require('child_process')
import esbuild = require('esbuild')
import fs = require('fs-extra')
import path = require('path')
import shell = require('shelljs')
import folders = require('./scriptUtils')
import { findMatchingFiles } from './scriptUtils'

const timeMessage = 'Packaged extension'
const manifestFile = 'vss-extension.json'

const vstsFiles = ['task.json', 'task.loc.json', 'icon.png', 'Strings']

interface CommandLineOptions {
    publisher?: string
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
        const response = shell.exec('git rev-parse HEAD', { silent: true })
        if (response.code !== 0) {
            console.log('Warning: unable to run git rev-parse to get commit hash!')
        } else {
            console.log(`Putting git hash ${response.stdout.trim()} into the package directory`)
            fs.outputFileSync(path.join(folders.packageRoot, '.gitcommit'), response.stdout.trim())
        }
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

    // get required npm packages that will be coppied
    installNodePackages(npmFolder)

    // clean, dedupe and pack each task as needed
    findMatchingFiles(folders.sourceTasks).forEach(function(taskDirectory) {
        const taskName = taskDirectory.split(path.sep)[0]
        console.log('Processing task ' + taskName)

        const taskBuildFolder = path.join(folders.buildTasks, taskDirectory)
        const taskPackageFolder = path.join(folders.packageTasks, taskDirectory)
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
                target: 'es2018',
                minify: false,
                outfile: `${taskPackageFolder}/${taskName}.js`
            })
            result.warnings.forEach(warning => console.log(warning))
        } catch (err) {
            console.error(err.output ? err.output.toString() : err.message)
            process.exit(1)
        }
    })

    console.log('Creating deployment vsix')
    let tfxcmd = `tfx extension create --root ${folders.packageRoot} --output-path ${
        folders.packageRoot
    } --manifests ${path.join(folders.packageRoot, manifestFile)}`
    if (options.publisher) {
        tfxcmd += ' --publisher ' + options.publisher
    }

    console.log('Packaging with:' + tfxcmd)

    ncp.execSync(tfxcmd, { stdio: 'pipe' })

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
