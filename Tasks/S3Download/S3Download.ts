/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');

import { SdkUtils } from 'sdkutils/sdkutils';
import { createDefaultS3Client } from 'sdkutils/defaultClients';

import { TaskParameters } from './DownloadTaskParameters';
import { TaskOperations } from './DownloadTaskOperations';

async function run(): Promise<void> {
    const taskManifestFile = path.join(__dirname, 'task.json');
    tl.setResourcePath(taskManifestFile);
    SdkUtils.setSdkUserAgentFromManifest(taskManifestFile);

    const taskParameters = TaskParameters.build();
    const s3 = await createDefaultS3Client(taskParameters.awsConnectionParameters, taskParameters.forcePathStyleAddressing, tl.debug);
    return new TaskOperations(s3, taskParameters).execute();
}

// run
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, '')
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);
