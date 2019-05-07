/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra')
const path = require('path')
var ncp = require('child_process')
var shell = require('shelljs');

const timeMessage = 'Packaged extension'
var manifestFile = 'vss-extension.json';
const tasksDirectory = 'Tasks'
const repoRoot = path.dirname(__dirname)
const inTasks = path.join(repoRoot, tasksDirectory)
const outBuildTasks = path.join(repoRoot, '_build', tasksDirectory)
const outPackage = path.join(repoRoot, '_package')
const outPackageTasks = path.join(outPackage, tasksDirectory)

function findMatchingFiles(directory) {
    return fs.readdirSync(directory)
}


function package() {
    fs.mkdirpSync(outPackage);

    // stage license, readme and the extension manifest file
    var packageRootFiles =  [ manifestFile, 'LICENSE', 'README.md' ];
    packageRootFiles.forEach(function(item) {
        fs.copySync(path.join(repoRoot, item), path.join(outPackage, item), {overwrite: true});
    });

    // stage manifest images
    fs.copySync(path.join(repoRoot, 'images'), path.join(outPackage, 'images'), {overwrite: true});

    fs.mkdirpSync(outPackageTasks);

    // clean, dedupe and pack each task as needed
    findMatchingFiles(inTasks).forEach(function(taskName) {
        console.log('> processing task ' + taskName);

        var taskBuildFolder = path.join(outBuildTasks, taskName);
        var taskPackageFolder = path.join(outPackageTasks, taskName);
        fs.mkdirpSync(taskPackageFolder);

        var taskDef = require(path.join(taskBuildFolder, 'task.json'));
        if (taskDef.execution.hasOwnProperty('Node')) {
            shell.cd(taskBuildFolder);
            fs.copySync(path.join(taskBuildFolder, 'task.json'), path.join(taskPackageFolder, 'task.json'), {overwrite: true});
            fs.copySync(path.join(taskBuildFolder, 'task.loc.json'), path.join(taskPackageFolder, 'task.loc.json'), {overwrite: true});
            fs.copySync(path.join(taskBuildFolder, 'package.json'), path.join(taskPackageFolder, 'package.json'), {overwrite: true});
            fs.copySync(path.join(taskBuildFolder, 'icon.png'), path.join(taskPackageFolder, 'icon.png'), {overwrite: true});
            fs.copySync(path.join(taskBuildFolder, 'Strings'), path.join(taskPackageFolder, 'Strings'), {overwrite: true});

            console.log('> packing node-based task');
            var webpackConfig = path.join(repoRoot, 'webpack.config.js');
            var webpackCmd = 'webpack --config '
                                + webpackConfig
                                + ' '
                                + path.join(taskBuildFolder, taskName + '.js ')
                                + '-o '
                                + path.join(taskPackageFolder, taskName + '.js');
            console.log("jklsdfjkldfsjkldfsjkldfsldfjksdfjklslkd\n\n\n\nn\n\n\n\nn\n\n\n\n\nnfjs "+webpackCmd)
            try {
                output = ncp.execSync(webpackCmd);
                console.log(output)
            }
            catch (err) {
                console.error(err.output ? err.output.toString() : err.message);
                process.exit(1);
            }

            shell.cd(taskPackageFolder);
            var npmCmd = 'npm install vsts-task-lib' + (options.release ? ' --only=production' : '');
            try {
                output = ncp.execSync(npmCmd);
                console.log(output)
            }
            catch (err) {
                console.error(err.output ? err.output.toString() : err.message);
                process.exit(1);
            };

            shell.cd(repoRoot);
        } else {
            console.log('Copying non-node task ' + taskName);

            fs.copySync(taskBuildFolder, taskPackageFolder);
        }
    });

    console.log('Creating deployment vsix');
    var tfxcmd = 'tfx extension create --root ' + packageRoot + ' --output-path ' + packageRoot + ' --manifests ' + path.join(packageRoot, manifestFile);
    if (options.publisher)
        tfxcmd += ' --publisher ' + options.publisher;

    ncp.execSync(tfxcmd);

    console.log('Packaging successful');
}

console.time(timeMessage)
package()
console.timeEnd(timeMessage)