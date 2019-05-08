/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra')
const jsonQuery = require('json-query');
const path = require('path')
const syncRequest = require('sync-request');
const validate = require('validator')

const timeMessage = 'Generated resources'
const taskJson = 'task.json'
const taskLocJson = 'task.loc.json'
const tasksDirectory = 'Tasks'
const masterVersionFile = '_versioninfo.json';
const repoRoot = path.dirname(__dirname)
const inTasks = path.join(repoRoot, tasksDirectory)
const outTasks = path.join(repoRoot, '_build', tasksDirectory)

function findMatchingFiles(directory) {
    return fs.readdirSync(directory)
}

// Downloads the latest known AWS regions file used by the various
// AWS toolkits and constructs an object we can inject into each
// task's region picker options.
function fetchLatestRegions() {
    console.log('Fetching AWS regions')

    var endpointsFileUrl = 'https://aws-toolkit-endpoints.s3.amazonaws.com/endpoints.json';

    var availableRegions = {}

    var res = syncRequest('GET', endpointsFileUrl);
    var allEndpoints = JSON.parse(res.getBody());

    for (var p = 0; p < allEndpoints.partitions.length; p++) {
        var partition = allEndpoints.partitions[p];

        var regionKeys = Object.keys(partition.regions);
        regionKeys.forEach((rk) => {
            availableRegions[rk] = `${partition.regions[rk].description} [${rk.toString()}]`;
        })
    }
    return availableRegions;
}

var validateTask = function (task) {
    if (!task.id || !validate.isUUID(task.id)) {
        fail('id is a required guid');
    };

    if (!task.name || !validate.isAlphanumeric(task.name)) {
        fail('name is a required alphanumeric string');
    }

    if (!task.friendlyName || !validate.isLength(task.friendlyName, 1, 40)) {
        fail('friendlyName is a required string <= 40 chars');
    }

    if (!task.instanceNameFormat) {
        fail('instanceNameFormat is required');
    }
};

function generateTaskLoc(taskLoc, taskPath) {
    taskLoc.friendlyName = 'ms-resource:loc.friendlyName';
    taskLoc.helpMarkDown = 'ms-resource:loc.helpMarkDown';
    taskLoc.description = 'ms-resource:loc.description';
    taskLoc.instanceNameFormat = 'ms-resource:loc.instanceNameFormat';

    if (taskLoc.hasOwnProperty('releaseNotes')) {
        taskLoc.releaseNotes = 'ms-resource:loc.releaseNotes';
    }

    if (taskLoc.hasOwnProperty('groups')) {
        taskLoc.groups.forEach(function (group) {
            if (group.hasOwnProperty('name')) {
                group.displayName = 'ms-resource:loc.group.displayName.' + group.name;
            }
        });
    }

    if (taskLoc.hasOwnProperty('inputs')) {
        taskLoc.inputs.forEach(function (input) {
            if (input.hasOwnProperty('name')) {
                input.label = 'ms-resource:loc.input.label.' + input.name;

                if (input.hasOwnProperty('helpMarkDown') && input.helpMarkDown) {
                    input.helpMarkDown = 'ms-resource:loc.input.help.' + input.name;
                }
            }
        });
    }

    if (taskLoc.hasOwnProperty('messages')) {
        Object.keys(taskLoc.messages).forEach(function (key) {
            taskLoc.messages[key] = 'ms-resource:loc.messages.' + key;
        });
    }

    fs.writeFileSync(path.join(outTasks, taskPath, taskLocJson), JSON.stringify(taskLoc, null, 2));
}

var createResjson = function (task, taskPath) {
    var resources = {};
    if (task.hasOwnProperty('friendlyName')) {
        resources['loc.friendlyName'] = task.friendlyName;
    }

    if (task.hasOwnProperty('helpMarkDown')) {
        resources['loc.helpMarkDown'] = task.helpMarkDown;
    }

    if (task.hasOwnProperty('description')) {
        resources['loc.description'] = task.description;
    }

    if (task.hasOwnProperty('instanceNameFormat')) {
        resources['loc.instanceNameFormat'] = task.instanceNameFormat;
    }

    if (task.hasOwnProperty('releaseNotes')) {
        resources['loc.releaseNotes'] = task.releaseNotes;
    }

    if (task.hasOwnProperty('groups')) {
        task.groups.forEach(function (group) {
            if (group.hasOwnProperty('name')) {
                resources['loc.group.displayName.' + group.name] = group.displayName;
            }
        });
    }

    if (task.hasOwnProperty('inputs')) {
        task.inputs.forEach(function (input) {
            if (input.hasOwnProperty('name')) {
                resources['loc.input.label.' + input.name] = input.label;

                if (input.hasOwnProperty('helpMarkDown') && input.helpMarkDown) {
                    resources['loc.input.help.' + input.name] = input.helpMarkDown;
                }
            }
        });
    }

    if (task.hasOwnProperty('messages')) {
        Object.keys(task.messages).forEach(function (key) {
            resources['loc.messages.' + key] = task.messages[key];
        });
    }

    var resjsonPath = path.join(outTasks, taskPath, 'Strings', 'resources.resjson', 'en-US', 'resources.resjson');
    mkdir('-p', path.dirname(resjsonPath));
    fs.writeFileSync(resjsonPath, JSON.stringify(resources, null, 2));
}

function addVersionToTask(task) {
    task.version = {
        Major: versionInfo.Major,
        Minor: versionInfo.Minor,
        Patch: versionInfo.Patch
    }
    return task
}

function addAWSRegionsToTask(task) {
    knownRegions = fetchLatestRegions()

    var regionNameInput = jsonQuery('inputs[name=regionName]', {
        data: task
    }).value;

    regionNameInput.options = knownRegions;

    return task
}

function writeTask(task, taskPath) {
    fs.writeFileSync(path.join(outTasks, taskPath, taskJson), JSON.stringify(task, null, 2));;
}

var createResjson = function (task, taskPath) {
    var resources = {};
    if (task.hasOwnProperty('friendlyName')) {
        resources['loc.friendlyName'] = task.friendlyName;
    }

    if (task.hasOwnProperty('helpMarkDown')) {
        resources['loc.helpMarkDown'] = task.helpMarkDown;
    }

    if (task.hasOwnProperty('description')) {
        resources['loc.description'] = task.description;
    }

    if (task.hasOwnProperty('instanceNameFormat')) {
        resources['loc.instanceNameFormat'] = task.instanceNameFormat;
    }

    if (task.hasOwnProperty('releaseNotes')) {
        resources['loc.releaseNotes'] = task.releaseNotes;
    }

    if (task.hasOwnProperty('groups')) {
        task.groups.forEach(function (group) {
            if (group.hasOwnProperty('name')) {
                resources['loc.group.displayName.' + group.name] = group.displayName;
            }
        });
    }

    if (task.hasOwnProperty('inputs')) {
        task.inputs.forEach(function (input) {
            if (input.hasOwnProperty('name')) {
                resources['loc.input.label.' + input.name] = input.label;

                if (input.hasOwnProperty('helpMarkDown') && input.helpMarkDown) {
                    resources['loc.input.help.' + input.name] = input.helpMarkDown;
                }
            }
        });
    }

    if (task.hasOwnProperty('messages')) {
        Object.keys(task.messages).forEach(function (key) {
            resources['loc.messages.' + key] = task.messages[key];
        });
    }

    var resjsonPath = path.join(outTasks, taskPath, 'Strings', 'resources.resjson', 'en-US', 'resources.resjson');
    fs.mkdirpSync(path.dirname(resjsonPath));
    fs.writeFileSync(resjsonPath, JSON.stringify(resources, null, 2));
};

function generateTaskResources(taskPath) {
    var taskJsonPath = path.join(inTasks, taskPath, taskJson);
    try {fs.accessSync(taskJsonPath) } catch (e) { return }

    var task = JSON.parse(fs.readFileSync(taskJsonPath));
    validateTask(task)
    task = addVersionToTask(task)
    task = addAWSRegionsToTask(task)
    writeTask(task, taskPath)
    generateTaskLoc(task, taskPath)
    createResjson(task, taskPath)
};

console.time(timeMessage)
var versionInfoFile = path.join(repoRoot, masterVersionFile);
var versionInfo = JSON.parse(fs.readFileSync(versionInfoFile));
var knownRegions = fetchLatestRegions()
findMatchingFiles(inTasks).forEach((path) =>
    {
        generateTaskResources(path)
    }
)
console.timeEnd(timeMessage)