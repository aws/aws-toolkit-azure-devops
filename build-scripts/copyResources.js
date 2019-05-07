/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

/*
    This script is called from npm run compile. It copies the
    files and directories listed in `relativePaths` to `out/`.
*/

const fs = require('fs-extra')
const path = require('path')

const timeMessage = 'Copied resources'
const tasksDirecotry = 'Tasks'
const repoRoot = path.dirname(__dirname)
const inTasks = path.join(repoRoot, tasksDirecotry)
const outTasks = path.join(repoRoot, '_build', tasksDirecotry)

const bannedFiles = [
    'tsconfig.json',
    'make.json'
]

const bannedExtensions = [
    'ts'
]

const filterFunc = (src, dest) => {
    return bannedFiles.every((element) => {
        if(src.includes(element)) {
            return false
        }
        return true
    }) 
    &&  
    bannedExtensions.every((element) => {
        if(src.endsWith(element)) {
            return false
        }
        return true
    })
}

const options = {
    overwrite: true,
    filter: filterFunc
}

console.time(timeMessage)
console.log('Copying files from ' + inTasks + ' to ' + outTasks)
fs.copy(inTasks, outTasks, options)
    .then(() => console.info('Successfully coppied files'))
    .catch((error) => console.info('Copy failed with error: ' + error))
console.timeEnd(timeMessage)