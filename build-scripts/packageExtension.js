/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra')
const path = require('path')
const ncp = require('child_process')
const shell = require('shelljs');

const timeMessage = 'Packaged extension'
const manifestFile = 'vss-extension.json';
const tasksDirectory = 'Tasks'
const repoRoot = path.dirname(__dirname)
const inTasks = path.join(repoRoot, tasksDirectory)
const outBuildTasks = path.join(repoRoot, '_build', tasksDirectory)
const outPackage = path.join(repoRoot, '_package')
const outPackageTasks = path.join(outPackage, tasksDirectory)

const unprocessFolders = [
    'Common',
    '.DS_Store'
]

function findMatchingFiles(directory) {
    return fs.readdirSync(directory)
}


function package(options) {
    fs.mkdirpSync(outPackage);

    fs.copySync(path.join(repoRoot, 'LICENSE'), path.join(outPackage, 'LICENSE'), {overwrite: true});
    fs.copySync(path.join(repoRoot, 'README.md'), path.join(outPackage, 'README.md'), {overwrite: true});
    fs.copySync(path.join(repoRoot, '_build', manifestFile), path.join(outPackage, manifestFile), {overwrite: true});

    // stage manifest images
    fs.copySync(path.join(repoRoot, 'images'), path.join(outPackage, 'images'), {overwrite: true});

    fs.mkdirpSync(outPackageTasks);

    // clean, dedupe and pack each task as needed
    findMatchingFiles(inTasks).forEach(function(taskName) {
        console.log('Processing task ' + taskName);

        if(!unprocessFolders.every((folderName) => { return folderName !== taskName})) {
            console.log('Skpping task ' + taskName)
            return
        }

        var taskBuildFolder = path.join(outBuildTasks, taskName);
        var taskPackageFolder = path.join(outPackageTasks, taskName);
        fs.mkdirpSync(taskPackageFolder);

        var taskDef = require(path.join(taskBuildFolder, 'task.json'));
        if (!taskDef.execution.hasOwnProperty('Node')) {
            console.log('Copying non-node task ' + taskName);

            fs.copySync(taskBuildFolder, taskPackageFolder);
            return;
        }
        shell.cd(taskBuildFolder);
        fs.copySync(path.join(taskBuildFolder, 'task.json'), path.join(taskPackageFolder, 'task.json'), {overwrite: true});
        fs.copySync(path.join(taskBuildFolder, 'task.loc.json'), path.join(taskPackageFolder, 'task.loc.json'), {overwrite: true});
        fs.copySync(path.join(taskBuildFolder, 'package.json'), path.join(taskPackageFolder, 'package.json'), {overwrite: true});
        fs.copySync(path.join(taskBuildFolder, 'icon.png'), path.join(taskPackageFolder, 'icon.png'), {overwrite: true});
        fs.copySync(path.join(taskBuildFolder, 'Strings'), path.join(taskPackageFolder, 'Strings'), {overwrite: true});

        console.log('packing node-based task');
        var webpackConfig = path.join(repoRoot, 'webpack.config.js');
        var webpackCmd = 'webpack ' 
                            + '--config ' + webpackConfig + ' '
                            + taskName + '.js '
                            + '--output-path ' + path.join(taskPackageFolder) + ' '
                            + '--output-filename ' + taskName + '.js'
        console.log(webpackCmd)
        try {
            ncp.execSync(webpackCmd, {stdio: 'pipe'});
        }
        catch (err) {
            console.error(err.output ? err.output.toString() : err.message);
            process.exit(1);
        }

        shell.cd(taskPackageFolder);
        var npmCmd = 'npm install vsts-task-lib --only=production';
        try {
            output = ncp.execSync(npmCmd, {stdio: 'pipe'});
            console.log(output)
        }
        catch (err) {
            console.error(err.output ? err.output.toString() : err.message);
            process.exit(1);
        };

        shell.cd(repoRoot);
    });

    console.log('Creating deployment vsix');
    var tfxcmd = 'tfx extension create --root ' + outPackage + ' --output-path ' + outPackage + ' --manifests ' + path.join(outPackage, manifestFile);
    if (options.publisher) {
        tfxcmd += ' --publisher ' + options.publisher;
    }

    console.log('Packaging with:' + tfxcmd)

    ncp.execSync(tfxcmd, {stdio: 'pipe'});

    console.log('Packaging successful');
}

console.time(timeMessage)
var options = process.argv.slice(2);
if(options.length > 0 && options[0].startsWith('publisher')) {
    options.publisher = options[0].split('=')[1]
}
package(options)
console.timeEnd(timeMessage)