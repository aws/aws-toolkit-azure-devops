/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs-extra')
import folders = require('./scriptUtils')

const timeMessage = 'Copied resources'
const ignoredFiles = ['tsconfig.json', 'make.json']
const ignoreExtensions = ['.ts']

const filterFunc = (src: string, dest: string) => {
    return (
        ignoredFiles.every(element => !src.endsWith(element)) &&
        ignoreExtensions.every(element => !src.endsWith(element))
    )
}

const options = {
    overwrite: true,
    filter: filterFunc
}

console.time(timeMessage)
console.log(`Copying files from ${folders.sourceTasks} to ${folders.buildTasks}`)
fs.copy(folders.sourceTasks, folders.buildTasks, options)
    .then(() => console.info('Successfully copied files'))
    .catch(error => console.info(`Copy failed with error: ${error}`))
console.timeEnd(timeMessage)
