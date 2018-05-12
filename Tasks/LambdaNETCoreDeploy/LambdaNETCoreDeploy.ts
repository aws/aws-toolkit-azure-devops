/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');

import { TaskParameters } from './helpers/NetCoreDeployTaskParameters';
import { TaskOperations } from './helpers/NetCoreDeployTaskOperations';

function run(): Promise<void> {

    tl.setResourcePath(path.join(__dirname, 'task.json'));
    process.env.AWS_EXECUTION_ENV = 'VSTS-LambdaNETCoreDeploy';

    const taskParameters = new TaskParameters();
    return new TaskOperations(taskParameters).execute();
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);
