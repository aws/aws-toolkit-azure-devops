/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SSM = require('aws-sdk/clients/ssm');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './GetParameterTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        await this.createServiceClients();

        switch (this.taskParameters.readMode) {
            case 'single': {
                await this.readSingleParameterValue();
            }
            break;

            case 'hierarchy': {
                await this.readParameterHierarchy();
            }
            break;
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private ssmClient: SSM;

    private async createServiceClients(): Promise<void> {

        const ssmOpts: SSM.ClientConfiguration = {
            apiVersion: '2014-11-06'
        };
        this.ssmClient = await SdkUtils.createAndConfigureSdkClient(SSM, ssmOpts, this.taskParameters, tl.debug);
    }

    // Reads a single parameter value and stores it into the supplied variable name. SecureString parameter
    // types are stored as secret variables.
    private async readSingleParameterValue(): Promise<void> {
        const outputVariableName = this.transformParameterToVariableName(undefined);

        let parameterName = this.taskParameters.parameterName;
        if (this.taskParameters.parameterVersion) {
            parameterName += ':' + this.taskParameters.parameterVersion;
        }
        const response = await this.ssmClient.getParameter({
            Name: parameterName,
            WithDecryption: true
        }).promise();

        const isSecret = response.Parameter.Type === 'SecureString';
        console.log(tl.loc('SettingVariable', outputVariableName, parameterName, isSecret));
        tl.setVariable(outputVariableName, response.Parameter.Value, isSecret);
    }

    // Reads a hierarchy of parameters identified by a common name path. SecureString parameter types are
    // stored as secret variables.
    private async readParameterHierarchy(): Promise<void> {

        // do the path name prefixing as a convenience if the user failed to supply it
        let finalParameterPath: string;
        if (this.taskParameters.parameterPath.startsWith('/')) {
            finalParameterPath = this.taskParameters.parameterPath;
        } else {
            finalParameterPath = '/' + this.taskParameters.parameterPath;
        }

        console.log(tl.loc('ReadingParameterHierarchy', finalParameterPath, this.taskParameters.recursive));

        let nextToken: string;
        do {
            const response = await this.ssmClient.getParametersByPath({
                Path: finalParameterPath,
                Recursive: this.taskParameters.recursive,
                WithDecryption: true,
                NextToken: nextToken
            }).promise();

            for (const p of response.Parameters) {
                const outputVariableName = this.transformParameterToVariableName(p.Name);
                const isSecret = p.Type === 'SecureString';
                console.log(tl.loc('SettingVariable', outputVariableName, p.Name, isSecret));

                tl.setVariable(outputVariableName, p.Value, isSecret);
            }

            nextToken = response.NextToken;
        } while (nextToken);
    }

    // Transforms the read parameter name depending on task settings. If the task was set
    // to read a single parameter, the input parameter name is in the task parameters. When
    // reading a hierarchy, we pass in the individual parameter name from the collection
    // read by the task.
    private transformParameterToVariableName(readParameterName: string): string {

        let inputParameterName: string;
        if (readParameterName) {
            inputParameterName = readParameterName;
        } else {
            inputParameterName = this.taskParameters.parameterName;
        }

        let outputVariableName: string;
        switch (this.taskParameters.variableNameTransform) {
            case 'none': {
                outputVariableName = inputParameterName;
            }
            break;

            case 'leaf': {
                const parts = inputParameterName.split(/\//);
                // if the name ended in /, walk backwards
                for (let i: number = parts.length - 1; i > 0; i--) {
                    if (parts[i]) {
                        outputVariableName = parts[i];
                        break;
                    }
                }

                if (!outputVariableName) {
                    throw new Error(`Failed to determine leaf component of parameter name ${this.taskParameters.parameterName}`);
                }
            }
            break;

            case 'substitute': {
                let flags: string = '';
                if (this.taskParameters.globalMatch) {
                    flags += 'g';
                }
                if (this.taskParameters.caseInsensitiveMatch) {
                    flags += 'i';
                }
                const pattern = new RegExp(this.taskParameters.replacementPattern, flags);
                outputVariableName = inputParameterName.replace(pattern, this.taskParameters.replacementText);
            }
            break;

            // note this mode is only applicable to single name parameter reads
            case 'custom': {
                outputVariableName = this.taskParameters.customVariableName;
            }
            break;

            default: {
                throw new Error(`Unknown name transform mode ${this.taskParameters.variableNameTransform}`);
            }
        }

        if (this.taskParameters.variableNameTransform === 'none') {
            console.log(tl.loc('UsingParameterNameForVariable', inputParameterName));
        } else {
            console.log(tl.loc('TransformedParameterName', inputParameterName, outputVariableName));
        }

        return outputVariableName;
    }
}
