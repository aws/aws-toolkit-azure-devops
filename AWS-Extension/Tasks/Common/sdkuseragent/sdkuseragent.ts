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
