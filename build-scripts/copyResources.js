/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const folders = require('./scriptUtils')
const fs = require('fs-extra')

const timeMessage = 'Copied resources'
const ignoredFiles = [
    'tsconfig.json',
    'make.json'
]
const ignoreExtensions = [
    '.ts'
]

const filterFunc = (src, dest) => {
    return ignoredFiles.every((element) => {
        if(src.endsWith(element)) {
            return false
        }
        return true
    }) 
    &&  
    ignoreExtensions.every((element) => {
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
console.log('Copying files from ' + folders.inTasks + ' to ' + folders.outTasks)
fs.copy(folders.inTasks, folders.outTasks, options)
    .then(() => console.info('Successfully coppied files'))
    .catch((error) => console.info('Copy failed with error: ' + error))
console.timeEnd(timeMessage)