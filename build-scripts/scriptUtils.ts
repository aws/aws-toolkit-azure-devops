/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as path from 'path'
import * as fs from 'fs-extra'

export const repoRoot = path.dirname(__dirname)
export const sourceTasks = path.join(repoRoot, 'src', 'tasks')
export const buildRoot = path.join(repoRoot, 'build')
export const buildTasks = path.join(buildRoot, 'src', 'tasks')
export const packageRoot = path.join(repoRoot, 'package')
// This is uppercase for backwards compatibility
export const packageTasks = path.join(packageRoot, 'Tasks')
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const releaseVersion = require(path.join(repoRoot, 'package.json')).version

export function findMatchingFiles(directory: string) {
    const folders = fs
        .readdirSync(directory, { withFileTypes: true })
        .filter(file => file.isDirectory())
        .map(file => file.name)
    // if it's a task with multiple versions, it will have the form <parent>V<version>
    const finalFolders: string[] = []
    folders.forEach(folder => {
        const subFiles = fs.readdirSync(path.join(sourceTasks, folder), { withFileTypes: true })
        if (
            subFiles.every(
                subFile => subFile.isDirectory() && RegExp(`^${folder}V[0-9]*$`).exec(subFile.name) !== undefined
            )
        ) {
            finalFolders.push(...subFiles.map(subFile => path.join(folder, subFile.name)))
        } else {
            finalFolders.push(folder)
        }
    })
    return finalFolders
}
