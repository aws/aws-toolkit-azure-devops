/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra')
const path = require('path')
var validate = require('validator')

const timeMessage = 'Generated resources'
const taskJson = 'task.json'
const TaskLocJson = 'task.loc.json'
const tasksDirectory = 'Tasks'
const repoRoot = path.dirname(__dirname)
const inTasks = path.join(repoRoot, tasksDirectory)
const outTasks = path.join(repoRoot, '_build', tasksDirectory)

function findMatchingFiles(directory) {
    return fs.readdirSync(directory)
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

    fs.writeFileSync(path.join(outTasks, taskPath, TaskLocJson), JSON.stringify(taskLoc, null, 2));
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
};

function generateTaskResources(taskPath) {
    var taskJsonPath = path.join(inTasks, taskPath, taskJson);
    try {fs.accessSync(taskJsonPath) } catch (e) { return }

    var task = JSON.parse(fs.readFileSync(taskJsonPath));
    validateTask(task)
    generateTaskLoc(task, taskPath)
    createResjson(task, taskPath)
};

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

console.time(timeMessage)
findMatchingFiles(inTasks).forEach((path) =>
    {
        generateTaskResources(path)
    }
)
console.timeEnd(timeMessage)