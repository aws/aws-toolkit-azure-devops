/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra')
const path = require('path')
var validate = require('validator')

const timeMessage = 'Packaged extension'
const taskJson = 'task.json'
const TaskLocJson = 'task.loc.json'
const tasksDirectory = 'Tasks'
const repoRoot = path.dirname(__dirname)
const inTasks = path.join(repoRoot, tasksDirectory)
const outTasks = path.join(repoRoot, '_build', tasksDirectory)
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
        cp(path.join(sourceRoot, item), outPackage);
    });

    // stage manifest images
    cp('-R', path.join(sourceRoot, 'images'), outPackage);

    fs.mkdirpSync(outPackageTasks);

    copyOverlayContent(options.overlayfolder, prebuild, buildRoot);

    // clean, dedupe and pack each task as needed
    findMatchingFiles(inTasks).forEach(function(taskName) {
        console.log('> processing task ' + taskName);

        var taskBuildFolder = path.join(buildTasksRoot, taskName);
        var taskPackageFolder = path.join(packageTasksRoot, taskName);
        mkdir('-p', taskPackageFolder);

        var taskDef = require(path.join(taskBuildFolder, 'task.json'));
        if (taskDef.execution.hasOwnProperty('Node')) {
            cd(taskBuildFolder);

            cp(path.join(taskBuildFolder, '*.json'), taskPackageFolder);
            cp(path.join(taskBuildFolder, '*.png'), taskPackageFolder);
            cp('-R', path.join(taskBuildFolder, 'Strings'), taskPackageFolder);

            console.log('> packing node-based task');
            var webpackConfig = path.join(sourceRoot, 'webpack.config.js');
            var webpackCmd = 'webpack --config '
                                + webpackConfig
                                + ' '
                                + taskName + '.js '
                                + path.join(taskPackageFolder, taskName + '.js');
            run(webpackCmd);

            // safely re-populate the unpacked vsts-task-lib
            cd(taskPackageFolder);
            var cmd = 'npm install vsts-task-lib' + (options.release ? ' --only=production' : '');
            run(cmd);

            cd(sourceRoot); // go back to consistent start location
        } else {
            console.log('> copying non-node task');

            matchCopy('**', taskBuildFolder, taskPackageFolder);
        }
    });

    copyOverlayContent(options.overlayfolder, postbuild, packageRoot);

    console.log('> creating deployment vsix');
    var tfxcmd = 'tfx extension create --root ' + packageRoot + ' --output-path ' + packageRoot + ' --manifests ' + path.join(packageRoot, manifestFile);
    if (options.publisher)
        tfxcmd += ' --publisher ' + options.publisher;

    run(tfxcmd);

    banner('Packaging successful', true);
}

console.time(timeMessage)
package()
console.timeEnd(timeMessage)