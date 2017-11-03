/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');

import sdkutils = require('sdkutils/sdkutils');

import Parameters = require ('./helpers/PushImageTaskParameters');
import Operations = require('./helpers/PushImageTaskOperations');

function run(): Promise<void> {

    const taskManifestFile = path.join(__dirname, 'task.json');
    tl.setResourcePath(taskManifestFile);
    sdkutils.setSdkUserAgentFromManifest(taskManifestFile);

    const taskParameters = new Parameters.TaskParameters();
    return Operations.TaskOperations.pushImage(taskParameters);
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);
