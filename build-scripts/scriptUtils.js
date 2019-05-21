/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')

repoRoot = path.dirname(__dirname)
tasksDirectory = 'Tasks'
sourceTasks = path.join(repoRoot, tasksDirectory)
buildRoot = path.join(repoRoot, '_build')
buildTasks = path.join(buildRoot, tasksDirectory)
packageRoot = path.join(repoRoot, '_package')
packageTasks = path.join(packageRoot, tasksDirectory)

module.exports = {
    repoRoot: repoRoot,
    sourceTasks: sourceTasks,
    buildRoot: buildRoot,
    buildTasks: buildTasks,
    packageRoot: packageRoot,
    packageTasks: packageTasks
}