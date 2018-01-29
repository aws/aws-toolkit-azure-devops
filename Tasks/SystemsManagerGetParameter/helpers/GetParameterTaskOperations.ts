/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import SSM = require('aws-sdk/clients/ssm');
import Parameters = require('./GetParameterTaskParameters');
import { AWSError } from 'aws-sdk/lib/error';
import sdkutils = require('sdkutils/sdkutils');

export class TaskOperations {

    public static async getParameterValues(taskParameters: Parameters.TaskParameters): Promise<void> {
        await this.createServiceClients(taskParameters);

        switch (taskParameters.readMode) {
            case 'single': {
                await this.readSingleParameterValue(taskParameters);
            }
            break;

            case 'hierarchy': {
                await this.readParameterHierarchy(taskParameters);
            }
            break;
        }

        console.log(tl.loc('TaskCompleted'));
    }

    private static ssmClient: SSM;

    private static async createServiceClients(taskParameters: Parameters.TaskParameters): Promise<void> {

        const ssmOpts: SSM.ClientConfiguration = {
            apiVersion: '2014-11-06',
            credentials: taskParameters.Credentials,
            region: taskParameters.awsRegion
        };
        this.ssmClient = sdkutils.createAndConfigureSdkClient(SSM, ssmOpts, taskParameters, tl.debug);
    }

    // Reads a single parameter value and stores it into the supplied variable name. SecureString parameter
    // types are stored as secret variables.
    private static async readSingleParameterValue(taskParameters: Parameters.TaskParameters): Promise<void> {
        const outputVariableName = this.transformParameterToVariableName(taskParameters, null);

        let parameterName = taskParameters.parameterName;
        if (taskParameters.parameterVersion) {
            parameterName += ':' + taskParameters.parameterVersion;
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
    private static async readParameterHierarchy(taskParameters: Parameters.TaskParameters): Promise<void> {

        // do the path name prefixing as a convenience if the user failed to supply it
        let finalParameterPath: string;
        if (taskParameters.parameterPath.startsWith('/')) {
            finalParameterPath = taskParameters.parameterPath;
        } else {
            finalParameterPath = '/' + taskParameters.parameterPath;
        }

        console.log(tl.loc('ReadingParameterHierarchy', finalParameterPath, taskParameters.recursive));

        let nextToken: string;
        do {
            const response = await this.ssmClient.getParametersByPath({
                Path: finalParameterPath,
                Recursive: taskParameters.recursive,
                WithDecryption: true,
                NextToken: nextToken
            }).promise();

            for (const p of response.Parameters) {
                const outputVariableName = this.transformParameterToVariableName(taskParameters, p.Name);
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
    private static transformParameterToVariableName(taskParameters:  Parameters.TaskParameters, readParameterName: string): string {

        let inputParameterName: string;
        if (readParameterName) {
            inputParameterName = readParameterName;
        } else {
            inputParameterName = taskParameters.parameterName;
        }

        let outputVariableName: string;
        switch (taskParameters.variableNameTransform) {
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
                    throw new Error(`Failed to determine leaf component of parameter name ${taskParameters.parameterName}`);
                }
            }
            break;

            case 'substitute': {
                let flags: string = '';
                if (taskParameters.globalMatch) {
                    flags += 'g';
                }
                if (taskParameters.caseInsensitiveMatch) {
                    flags += 'i';
                }
                const pattern = new RegExp(taskParameters.replacementPattern, flags);
                outputVariableName = inputParameterName.replace(pattern, taskParameters.replacementText);
            }
            break;

            // note this mode is only applicable to single name parameter reads
            case 'custom': {
                outputVariableName = taskParameters.customVariableName;
            }
            break;

            default: {
                throw new Error(`Unknown name transform mode ${taskParameters.variableNameTransform}`);
            }
        }

        if (taskParameters.variableNameTransform === 'none') {
            console.log(tl.loc('UsingParameterNameForVariable', inputParameterName));
        } else {
            console.log(tl.loc('TransformedParameterName', inputParameterName, outputVariableName));
        }

        return outputVariableName;
    }
}
