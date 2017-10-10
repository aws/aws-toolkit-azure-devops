/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');

import Parameters = require('./helpers/AWSCliTaskParameters');
import Operations = require('./helpers/AWSCliTaskOperations');

tl.setResourcePath(path.join(__dirname, 'task.json'));
process.env.AWS_EXECUTION_ENV = 'VSTS-AWSCLI';

const taskParameters = new Parameters.TaskParameters();

if (Operations.TaskOperations.checkIfAwsCliIsInstalled()) {
    Operations.TaskOperations.executeCommand(taskParameters);
}
