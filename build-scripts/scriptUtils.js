/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')

const repoRoot = path.dirname(__dirname)
const sourceTasks = path.join(repoRoot, 'src', 'tasks')
const buildRoot = path.join(repoRoot, 'build')
const buildTasks = path.join(buildRoot, 'src', 'tasks')
const packageRoot = path.join(repoRoot, 'package')
// This is uppercase for backwards compatibility
const packageTasks = path.join(packageRoot, 'Tasks')
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
