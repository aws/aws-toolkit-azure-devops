/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as fs from 'fs-extra'
import JsonQuery from 'json-query'
import * as path from 'path'
import axios from 'axios'
import validator from 'validator'

import { buildTasks, findMatchingFiles, releaseVersion, repoRoot, sourceTasks, Task } from './scriptUtils'
import isUUID = validator.isUUID
import isAlphanumeric = validator.isAlphanumeric
import isLength = validator.isLength

const timeMessage = 'Generated resources'
const taskJsonName = 'task.json'
const taskLocJsonName = 'task.loc.json'
const vssPath = path.join(repoRoot, 'vss-extension.json')
const vssBuildPath = path.join(repoRoot, 'build', 'vss-extension.json')

// Downloads the latest known AWS regions file used by the various
// AWS toolkits and constructs an object we can inject into each
// task's region picker options.
async function fetchLatestRegions(): Promise<string[]> {
    console.log('Fetching AWS regions')

    const endpointsFileUrl = 'https://aws-toolkit-endpoints.s3.amazonaws.com/endpoints.json'

    const availableRegions: any = {}

    const res = await axios.get(endpointsFileUrl)
    const allEndpoints = res.data

    for (let p = 0; p < allEndpoints.partitions.length; p++) {
        const partition = allEndpoints.partitions[p]

        const regionKeys = Object.keys(partition.regions)
        regionKeys.forEach((rk: string) => {
            availableRegions[rk] = `${partition.regions[rk].description} [${rk.toString()}]`
        })
    }
    return availableRegions
}

function validateTask(task: any) {
    if (!task.id || !isUUID(task.id)) {
        console.error(`Validation failure, id is a required guid for task:\n${task}`)
        process.exit(1)
    }

    if (!task.name || !isAlphanumeric(task.name)) {
        console.error(`name is a required alphanumeric string for task:\n${task}`)
        process.exit(1)
    }

    if (!task.friendlyName || !isLength(task.friendlyName, { min: 1, max: 40 })) {
        console.error(`friendlyName is a required string <= 40 chars for task:\n${task}`)
        process.exit(1)
    }

    if (!task.instanceNameFormat) {
        console.error(`instanceNameFormat is required for task:\n${task}`)
        process.exit(1)
    }
}

function generateTaskLoc(taskLoc: any, taskPath: string) {
    taskLoc.friendlyName = 'ms-resource:loc.friendlyName'
    taskLoc.helpMarkDown = 'ms-resource:loc.helpMarkDown'
    taskLoc.description = 'ms-resource:loc.description'
    taskLoc.instanceNameFormat = 'ms-resource:loc.instanceNameFormat'

    if (Object.hasOwnProperty.call(taskLoc, 'releaseNotes')) {
        taskLoc.releaseNotes = 'ms-resource:loc.releaseNotes'
    }

    if (Object.hasOwnProperty.call(taskLoc, 'groups')) {
        taskLoc.groups.forEach(function(group: any) {
            if (Object.hasOwnProperty.call(group, 'name')) {
                group.displayName = `ms-resource:loc.group.displayName.${group.name}`
            }
        })
    }

    if (Object.hasOwnProperty.call(taskLoc, 'inputs')) {
        taskLoc.inputs.forEach(function(input: any) {
            if (Object.hasOwnProperty.call(input, 'name')) {
                input.label = `ms-resource:loc.input.label.${input.name}`

                if (Object.hasOwnProperty.call(input, 'helpMarkDown') && input.helpMarkDown) {
                    input.helpMarkDown = `ms-resource:loc.input.help.${input.name}`
                }
            }
        })
    }

    if (Object.hasOwnProperty.call(taskLoc, 'messages')) {
        Object.keys(taskLoc.messages).forEach(function(key) {
            taskLoc.messages[key] = `ms-resource:loc.messages.${key}`
        })
    }

    fs.writeFileSync(path.join(buildTasks, taskPath, taskLocJsonName), JSON.stringify(taskLoc, undefined, 2))
}

function addVersionToTask(task: any, majorVersion: number, versionInfo: string) {
    const info = versionInfo.split('.')
    task.version = {
        Major: majorVersion.toString(),
        Minor: info[1],
        Patch: info[2]
    }
}

function addAWSRegionsToTask(task: any, knownRegions: string[]) {
    const regionNameInput = JsonQuery('inputs[name=regionName]', {
        data: task
    }).value

    regionNameInput.options = knownRegions
}

function writeTask(task: any, taskPath: string): void {
    fs.writeFileSync(path.join(buildTasks, taskPath, taskJsonName), JSON.stringify(task, undefined, 2))
}

function createResjson(task: any, taskPath: string): void {
    const resources: any = {}
    if (Object.hasOwnProperty.call(task, 'friendlyName')) {
        resources['loc.friendlyName'] = task.friendlyName
    }

    if (Object.hasOwnProperty.call(task, 'helpMarkDown')) {
        resources['loc.helpMarkDown'] = task.helpMarkDown
    }

    if (Object.hasOwnProperty.call(task, 'description')) {
        resources['loc.description'] = task.description
    }

    if (Object.hasOwnProperty.call(task, 'instanceNameFormat')) {
        resources['loc.instanceNameFormat'] = task.instanceNameFormat
    }

    if (Object.hasOwnProperty.call(task, 'releaseNotes')) {
        resources['loc.releaseNotes'] = task.releaseNotes
    }

    if (Object.hasOwnProperty.call(task, 'groups')) {
        task.groups.forEach(function(group: any) {
            if (Object.hasOwnProperty.call(group, 'name')) {
                resources[`loc.group.displayName.${group.name}`] = group.displayName
            }
        })
    }

    if (Object.hasOwnProperty.call(task, 'inputs')) {
        task.inputs.forEach(function(input: any) {
            if (Object.hasOwnProperty.call(input, 'name')) {
                resources[`loc.input.label.${input.name}`] = input.label

                if (Object.hasOwnProperty.call(input, 'helpMarkDown') && input.helpMarkDown) {
                    resources[`loc.input.help.${input.name}`] = input.helpMarkDown
                }
            }
        })
    }

    if (Object.hasOwnProperty.call(task, 'messages')) {
        Object.keys(task.messages).forEach(function(key) {
            resources[`loc.messages.${key}`] = task.messages[key]
        })
    }

    const resjsonPath = path.join(buildTasks, taskPath, 'Strings', 'resources.resjson', 'en-US', 'resources.resjson')
    fs.mkdirpSync(path.dirname(resjsonPath))
    fs.writeFileSync(resjsonPath, JSON.stringify(resources, undefined, 2))
}

function generateTaskResources(task: Task, knownRegions: string[], versionInfo: string): void {
    const taskJsonPath = path.join(sourceTasks, task.taskPath, taskJsonName)
    try {
        fs.accessSync(taskJsonPath)
    } catch (e) {
        return
    }

    const taskJson = JSON.parse(fs.readFileSync(taskJsonPath, 'utf-8'))
    validateTask(taskJson)
    addVersionToTask(taskJson, task.majorVersion, versionInfo)
    addAWSRegionsToTask(taskJson, knownRegions)
    writeTask(taskJson, task.taskPath)
    createResjson(taskJson, task.taskPath)
    generateTaskLoc(taskJson, task.taskPath)
}

function addVersionToVssExtension(versionInfo: string): void {
    const vss = JSON.parse(fs.readFileSync(vssPath, 'utf-8'))
    vss.version = versionInfo
    fs.writeFileSync(vssBuildPath, JSON.stringify(vss, undefined, 2))
}

;(async () => {
    console.time(timeMessage)
    const knownRegions = await fetchLatestRegions()
    findMatchingFiles(sourceTasks).forEach(task => {
        generateTaskResources(task, knownRegions, releaseVersion)
    })
    addVersionToVssExtension(releaseVersion)
    console.timeEnd(timeMessage)
})()
