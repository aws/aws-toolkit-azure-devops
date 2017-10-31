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
                await this.readSingleParameterValue(taskParameters)
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
        const outputVariableName = this.transformParameterToVariableName(taskParameters.parameterName,
                                                                         taskParameters.variableNameTransform,
                                                                         taskParameters.customVariableName,
                                                                         taskParameters.pathSubstitutionCharacter);

        const response = await this.ssmClient.getParameter({
            Name: taskParameters.parameterName,
            WithDecryption: true
        }).promise();

        const isSecret = response.Parameter.Type === 'SecureString';
        console.log(tl.loc('SettingVariable', outputVariableName, taskParameters.parameterName, isSecret));
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
                const outputVariableName = this.transformParameterToVariableName(p.Name,
                                                                                 taskParameters.variableNameTransform,
                                                                                 null,
                                                                                 taskParameters.pathSubstitutionCharacter);
                const isSecret = p.Type === 'SecureString';
                console.log(tl.loc('SettingVariable', outputVariableName, p.Name, isSecret));

                tl.setVariable(outputVariableName, p.Value, isSecret);
            }

            nextToken = response.NextToken;
        } while (nextToken);
    }

    private static transformParameterToVariableName(parameterName: string,
                                                    transform: string,
                                                    customVariableName: string,
                                                    pathSubstitutionCharacter: string): string {

        let outputVariableName: string;
        switch (transform) {
            case 'none': {
                outputVariableName = parameterName;
            }
            break;

            case 'leaf': {
                const parts = parameterName.split(/\//);
                // if the name ended in /, walk backwards
                for (let i: number = parts.length - 1; i > 0; i--) {
                    if (parts[i]) {
                        outputVariableName = parts[i];
                        break;
                    }
                }

                if (!outputVariableName) {
                    throw new Error(`Failed to determine leaf component of parameter name ${parameterName}`);
                }
            }
            break;

            case 'substitute': {
                outputVariableName = parameterName.replace(/\//g, pathSubstitutionCharacter);
            }
            break;

            // note this mode is only applicable to single name parameter reads
            case 'custom': {
                outputVariableName = customVariableName;
            }
            break;

            default: {
                throw new Error(`Unknown name transform mode ${transform}`);
            }
        }

        if (transform === 'none') {
            console.log(tl.loc('UsingParameterNameForVariable', parameterName));
        } else {
            console.log(tl.loc('TransformedParameterName', parameterName, outputVariableName));
        }

        return outputVariableName;
    }
}
