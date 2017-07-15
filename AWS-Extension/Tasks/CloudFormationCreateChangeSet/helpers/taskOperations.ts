import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import awsS3 = require('aws-sdk/clients/s3');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async createChangeSet(taskParameters: TaskParameters.CreateChangeSetTaskParameters): Promise<void> {
        this.createServiceClients(taskParameters);

        let stackId: string;
        if (taskParameters.templateSource === 'NewTemplate') {
            stackId = await this.createChangeSetFromTemplateFile(taskParameters);
        } else {
            stackId = await this.createChangeSetFromOriginalTemplate(taskParameters);
        }

        if (taskParameters.autoExecute) {
            await this.executeChangeSet(taskParameters.changeSetName, taskParameters.stackName);
        }

        if (taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable));
            tl.setVariable(taskParameters.outputVariable, stackId);
        }

        console.log(tl.loc('TaskCompleted', taskParameters.changeSetName, stackId));
    }

    private static cloudFormationClient: awsCloudFormation;

    private static s3Client: awsS3;

    private static createServiceClients(taskParameters: TaskParameters.CreateChangeSetTaskParameters) {
        this.cloudFormationClient = new awsCloudFormation({
            apiVersion: '2010-05-15',
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            region: taskParameters.awsRegion
        });

        this.s3Client = new awsS3({
            apiVersion: '2006-03-01',
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            region: taskParameters.awsRegion
        });
    }

    private static async createChangeSetFromOriginalTemplate(taskParameters: TaskParameters.CreateChangeSetTaskParameters) : Promise<string> {
        console.log(tl.loc('CreatingChangesetFromPreviousTemplate'));

        let templateParameters: awsCloudFormation.Parameters;

        try {
            if (taskParameters.templateParametersFile) {
                console.log(tl.loc('LoadingTemplateParameterFile', taskParameters.templateParametersFile));
                templateParameters = JSON.parse(fs.readFileSync(taskParameters.templateParametersFile, 'utf8'));
                tl.debug('Successfully loaded template file');
            }
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        const request: awsCloudFormation.CreateChangeSetInput = {
            ChangeSetName: taskParameters.changeSetName,
            ChangeSetType: taskParameters.changeSetType,
            StackName: taskParameters.stackName,
            UsePreviousTemplate: true,
            Parameters: templateParameters,
            Description: taskParameters.description,
            NotificationARNs: taskParameters.notificationARNs,
            ResourceTypes: taskParameters.resourceTypes,
            RoleARN: taskParameters.roleARN
        };

        return await this.createChangeSetFromRequest(request);
    }

    private static async createChangeSetFromTemplateFile(taskParameters: TaskParameters.CreateChangeSetTaskParameters) : Promise<string> {
        console.log(tl.loc('CreatingChangesetFromFiles', taskParameters.templateFile, taskParameters.templateParametersFile));

        let template: string;
        let templateParameters: awsCloudFormation.Parameters;

        try {
            console.log(tl.loc('LoadingTemplateFile', taskParameters.templateFile));
            template = fs.readFileSync(taskParameters.templateFile, 'utf8');
            tl.debug('Successfully loaded template file');

            if (taskParameters.templateParametersFile) {
                console.log(tl.loc('LoadingTemplateParameterFile', taskParameters.templateParametersFile));
                templateParameters = JSON.parse(fs.readFileSync(taskParameters.templateParametersFile, 'utf8'));
                tl.debug('Successfully loaded template file');
            }
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        const request: awsCloudFormation.CreateChangeSetInput = {
            ChangeSetName: taskParameters.changeSetName,
            ChangeSetType: taskParameters.changeSetType,
            StackName: taskParameters.stackName,
            Parameters: templateParameters,
            TemplateBody: template,
            Description: taskParameters.description,
            NotificationARNs: taskParameters.notificationARNs,
            ResourceTypes: taskParameters.resourceTypes,
            RoleARN: taskParameters.roleARN
        };

        return await this.createChangeSetFromRequest(request);
    }

    private static async executeChangeSet(changeSetName: string, stackName: string) : Promise<void> {
        console.log(tl.loc('ExecutingChangeset', changeSetName, stackName));

        try {
            await this.cloudFormationClient.executeChangeSet({
                ChangeSetName: changeSetName,
                StackName: stackName
            }).promise();

            await this.waitForStackCreation(stackName);
        } catch (err) {
            console.error(tl.loc('ExecuteChangesetFailed', err.message), err);
            throw err;
        }
    }

    private static async createChangeSetFromRequest(request: awsCloudFormation.CreateChangeSetInput) : Promise<string> {
        try {
            const response: awsCloudFormation.CreateChangeSetOutput = await this.cloudFormationClient.createChangeSet(request).promise();

            tl.debug(`Change set id ${response.Id}, stack id ${response.StackId}`);
            await this.waitForChangeSetCreation(request.ChangeSetName, response.StackId);
            return response.StackId;
        }  catch (err) {
            console.error(tl.loc('ChangesetCreationFailed', err.message), err);
            throw err;
        }
    }

    private static async waitForChangeSetCreation(changeSetName: string, stackId: string) : Promise<void> {

        return new Promise<void>((resolve, reject) => {
            console.log(tl.loc('WaitingForChangesetValidation', changeSetName));

            this.cloudFormationClient.waitFor('changeSetCreateComplete',
                                              { ChangeSetName: changeSetName, StackName: stackId },
                                              function(err: AWSError, data: awsCloudFormation.DescribeChangeSetOutput) {
                if (err) {
                    throw new Error(tl.loc('ChangesetValidationFailed', changeSetName, err.message));
                } else {
                    console.log(tl.loc('ChangesetValidated'));
                }
            });
        });
    }

    private static async waitForStackCreation(stackName: string) : Promise<void> {

        return new Promise<void>((resolve, reject) => {
            console.log(tl.loc('WaitingForChangesetExecution', stackName));

            this.cloudFormationClient.waitFor('stackCreateComplete',
                                              { StackName: stackName },
                                              function(err: AWSError, data: awsCloudFormation.DescribeStacksOutput) {
                if (err) {
                    throw new Error(tl.loc('ExecuteChangesetFailed', err.message));
                } else {
                    console.log(tl.loc('ChangesetExecuted'));
                }
            });
        });
    }

}
