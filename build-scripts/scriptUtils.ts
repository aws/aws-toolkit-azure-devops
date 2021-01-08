/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as path from 'path'

export const repoRoot = path.dirname(__dirname)
export const sourceTasks = path.join(repoRoot, 'src', 'tasks')
export const buildRoot = path.join(repoRoot, 'build')
export const buildTasks = path.join(buildRoot, 'src', 'tasks')
export const packageRoot = path.join(repoRoot, 'package')
// This is uppercase for backwards compatibility
export const packageTasks = path.join(packageRoot, 'Tasks')
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const releaseVersion = require(path.join(repoRoot, 'package.json')).version
