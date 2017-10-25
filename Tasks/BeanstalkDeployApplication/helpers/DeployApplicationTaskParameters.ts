/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import sdkutils = require('sdkutils/sdkutils');

export class TaskParameters extends sdkutils.AWSTaskParametersBase {
    public applicationName: string;
    public environmentName: string;
    public webDeploymentArchive: string;
    public applicationType: string;
    public dotnetPublishPath: string;

    public readonly applicationTypeAspNet: string = 'aspnet';
    public readonly applicationTypeAspNetCoreForWindows: string = 'aspnetCoreWindows';

    constructor() {
        super();
        try {
            this.applicationType = tl.getInput('applicationType', true);
            console.log(tl.loc('DisplayApplicationType', this.applicationType));

            if (this.applicationType === this.applicationTypeAspNetCoreForWindows) {
                this.dotnetPublishPath = tl.getPathInput('dotnetPublishPath', true);
            } else {
                this.webDeploymentArchive = tl.getPathInput('webDeploymentArchive', true);
            }

            this.applicationName = tl.getInput('applicationName', true);
            this.environmentName = tl.getInput('environmentName', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
