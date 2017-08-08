/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import TaskOperationHelpers = require('./helpers/taskOperations');
import TaskParameters = require('./helpers/taskParameters');

tl.setResourcePath(path.join(__dirname, 'task.json'));
process.env.AWS_EXECUTION_ENV = 'VSTS-AWSCLI';

const taskParameters = new TaskParameters.CliTaskParameters();

if (TaskOperationHelpers.TaskOperations.checkIfAwsCliIsInstalled()) {
    TaskOperationHelpers.TaskOperations.executeCommand(taskParameters);
}
