/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')

const repoRoot = path.dirname(__dirname)
const tasksDirectory = 'tasks'
const sourceTasks = path.join(repoRoot, 'src', tasksDirectory)
const buildRoot = path.join(repoRoot, '_build')
const buildTasks = path.join(buildRoot, tasksDirectory)
const packageRoot = path.join(repoRoot, '_package')
const packageTasks = path.join(packageRoot, tasksDirectory)
const releaseVersion = require(path.join(repoRoot, 'package.json')).version

module.exports = {
    repoRoot: repoRoot,
    sourceTasks: sourceTasks,
    buildRoot: buildRoot,
    buildTasks: buildTasks,
    packageRoot: packageRoot,
    packageTasks: packageTasks,
    releaseVersion: releaseVersion
}
