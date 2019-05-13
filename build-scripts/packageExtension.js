/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra')
const path = require('path')
const ncp = require('child_process')
const shell = require('shelljs')
const folders = require('./scriptUtils')

const timeMessage = 'Packaged extension'
const manifestFile = 'vss-extension.json'

const ignoredFolders = [
    'Common',
    '.DS_Store'
]

const vstsFiles = [
    'task.json',
    'task.loc.json',
    'package.json',
    'icon.png',
    'Strings'
]

function findMatchingFiles(directory) {
    return fs.readdirSync(directory)
}

function package(options) {
    fs.mkdirpSync(folders.outPackage)

    fs.copySync(path.join(folders.repoRoot, 'LICENSE'), path.join(folders.outPackage, 'LICENSE'), {overwrite: true})
    fs.copySync(path.join(folders.repoRoot, 'README.md'), path.join(folders.outPackage, 'README.md'), {overwrite: true})
    fs.copySync(path.join(folders.repoRoot, '_build', manifestFile), path.join(folders.outPackage, manifestFile), {overwrite: true})

    // stage manifest images
    fs.copySync(path.join(folders.repoRoot, 'images'), path.join(folders.outPackage, 'images'), {overwrite: true})

    fs.mkdirpSync(folders.outPackageTasks)

    // clean, dedupe and pack each task as needed
    findMatchingFiles(folders.inTasks).forEach(function(taskName) {
        console.log('Processing task ' + taskName)

        if(ignoredFolders.some((folderName) => { return folderName === taskName})) {
            console.log('Skpping task ' + taskName)
            return
        }

        const taskBuildFolder = path.join(folders.outBuildTasks, taskName)
        const taskPackageFolder = path.join(folders.outPackageTasks, taskName)
        fs.mkdirpSync(taskPackageFolder)

        const taskDef = require(path.join(taskBuildFolder, 'task.json'))
        if (!taskDef.execution.hasOwnProperty('Node')) {
            console.log('Copying non-node task ' + taskName)

            fs.copySync(taskBuildFolder, taskPackageFolder)
            return
        }
        shell.cd(taskBuildFolder)
        for( const resourceFile of vstsFiles) {
            fs.copySync(path.join(taskBuildFolder, resourceFile), path.join(taskPackageFolder, resourceFile), {overwrite: true}) 
        }

        console.log('packing node-based task')
        const webpackConfig = path.join(folders.repoRoot, 'webpack.config.js')
        const webpackCmd = 'webpack '
                        + '--config ' + webpackConfig + ' '
                        + taskName + '.js '
                        + '--output-path ' + path.join(taskPackageFolder) + ' '
                        + '--output-filename ' + taskName + '.js' + ' '
        console.log(webpackCmd)
        try {
            ncp.execSync(webpackCmd, {stdio: 'pipe'})
        }
        catch (err) {
            console.error(err.output ? err.output.toString() : err.message)
            process.exit(1)
        }

        shell.cd(taskPackageFolder)
        var npmCmd = 'npm install vsts-task-lib --only=production'
        try {
            output = ncp.execSync(npmCmd, {stdio: 'pipe'})
            console.log(output)
        }
        catch (err) {
            console.error(err.output ? err.output.toString() : err.message)
            process.exit(1)
        }

        shell.cd(folders.repoRoot)
    })

    console.log('Creating deployment vsix')
    var tfxcmd = 'tfx extension create --root ' + folders.outPackage + ' --output-path ' + folders.outPackage + ' --manifests ' + path.join(folders.outPackage, manifestFile)
    if (options.publisher) {
        tfxcmd += ' --publisher ' + options.publisher
    }

    console.log('Packaging with:' + tfxcmd)

    ncp.execSync(tfxcmd, {stdio: 'pipe'})

    console.log('Packaging successful')
}

console.time(timeMessage)
var options = process.argv.slice(2)
if(options.length > 0 && options[0].split('=')[0] === 'publisher') {
    options.publisher = options[0].split('=')[1]
}
package(options)
console.timeEnd(timeMessage)