/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import path = require('path');
import fs = require('fs');

export function setUserAgentFromManifest(taskManifestFilePath: string) {

    if (fs.existsSync(taskManifestFilePath)) {
        const taskManifest = JSON.parse(fs.readFileSync(taskManifestFilePath, 'utf8'));
        const version = taskManifest.version;
        const userAgentString = 'AWS-VSTS/' +
                                version.Major + '.' + version.Minor + '.' + version.Patch +
                                ' Task/' +
                                taskManifest.name;

        const AWS = require('aws-sdk/global');
        AWS.util.userAgent = () => {
            return userAgentString;
        };
    } else {
        console.warn(`Task manifest ${taskManifestFilePath} not found, cannot set custom user agent!`);
    }

}
