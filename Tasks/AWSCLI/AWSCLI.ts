/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');

import { TaskParameters } from './helpers/AWSCliTaskParameters';
import { TaskOperations } from './helpers/AWSCliTaskOperations';

tl.setResourcePath(path.join(__dirname, 'task.json'));
process.env.AWS_EXECUTION_ENV = 'VSTS-AWSCLI';

const taskParameters = new TaskParameters();
if (TaskOperations.checkIfAwsCliIsInstalled()) {
    new TaskOperations(taskParameters).execute();
}
