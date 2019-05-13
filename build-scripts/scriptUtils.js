/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const path = require('path')

repoRoot = path.dirname(__dirname)
tasksDirectory = 'Tasks'
inTasks = path.join(repoRoot, tasksDirectory)
outTasks = path.join(repoRoot, '_build', tasksDirectory)
outBuildTasks = path.join(repoRoot, '_build', tasksDirectory)
outPackage = path.join(repoRoot, '_package')
outPackageTasks = path.join(outPackage, tasksDirectory)

module.exports = {
    repoRoot: repoRoot,
    inTasks: inTasks,
    outTasks: outTasks,
    outBuildTasks: outBuildTasks,
    outPackage: outPackage,
    outPackageTasks: outPackageTasks
}