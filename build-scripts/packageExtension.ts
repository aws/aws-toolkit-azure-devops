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
        // tslint:disable-next-line: no-unsafe-any
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
    fs.copySync(path.join(folders.repoRoot, '_build', manifestFile), path.join(folders.packageRoot, manifestFile), {
        overwrite: true
    })

    generateGitHashFile()

    // stage manifest images
    fs.copySync(path.join(folders.repoRoot, 'images'), path.join(folders.packageRoot, 'images'), { overwrite: true })

    // get required npm packages that will be coppied
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

        const taskDef = require(path.join(taskBuildFolder, 'task.json'))
        // tslint:disable-next-line: no-unsafe-any
        if (!taskDef.execution.hasOwnProperty('Node')) {
            console.log('Copying non-node task ' + taskName)
            fs.copySync(taskBuildFolder, taskPackageFolder)

            return
        }
        shell.cd(taskBuildFolder)
        for (const resourceFile of vstsFiles) {
            fs.copySync(path.join(taskBuildFolder, resourceFile), path.join(taskPackageFolder, resourceFile), {
                overwrite: true
            })
        }

        const inputFilename = taskName + '.runner.js'

        console.log('packing node-based task')
        try {
            const result = esbuild.buildSync({
                entryPoints: [inputFilename],
                bundle: true,
                platform: 'node',
                target: ['node6'],
                // external: ['azure-pipelines-task-lib'],
                minify: true,
                outfile: `${taskPackageFolder}/${taskName}.js`
            })
            result.warnings.forEach(warning => console.log(warning))
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            console.error(err.output ? err.output.toString() : err.message)
            process.exit(1)
        }
        // shell.cp('-rL', path.join(npmFolder, 'node_modules'), taskPackageFolder)
        shell.cd(folders.repoRoot)
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
