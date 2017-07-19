import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import awsS3 = require('aws-sdk/clients/s3');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async createOrUpdateStack(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters): Promise<void> {
        this.createServiceClients(taskParameters);

        let stackId: string = await this.testStackExists(taskParameters.stackName);
        if (stackId) {
            console.log(tl.loc('StackExists', taskParameters.stackName));
            await this.updateStack(taskParameters);
        } else {
            console.log(tl.loc('StackNotExist', taskParameters.stackName));
            stackId = await this.createStack(taskParameters);
        }

        if (taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', taskParameters.outputVariable));
            tl.setVariable(taskParameters.outputVariable, stackId);
        }

        console.log(tl.loc('TaskCompleted', taskParameters.stackName, stackId));
    }

    private static cloudFormationClient: awsCloudFormation;
    private static s3Client: awsS3;

    private static createServiceClients(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) {

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

    private static async testStackExists(stackName: string) : Promise<string> {
        console.log(tl.loc('CheckingForStackExistence', stackName));

        try {
            const response: awsCloudFormation.DescribeStacksOutput = await this.cloudFormationClient.describeStacks({
                StackName: stackName
            }).promise();
            if (response.Stacks.length > 0) {
                return response.Stacks[0].StackId;
            }
        } catch (err) {
            tl.debug(`Test for stack ${stackName} threw exception: ${err.message}, assuming stack does not exist`);
        }

        return null;
    }

    private static async createStack(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) : Promise<string> {

        let template: string;
        let templateParameters: awsCloudFormation.Parameters;

        try {
            template = await this.loadTemplateFile(taskParameters.templateFile);
            if (taskParameters.templateParametersFile) {
                templateParameters = await this.loadParametersFromFile(taskParameters.templateParametersFile);
            }
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        if (taskParameters.useChangeset) {
            console.log(tl.loc('CreateStackWithChangeset', taskParameters.templateFile, taskParameters.templateParametersFile, taskParameters.changesetName));
            return await this.createOrUpdateWithChangeset(taskParameters, 'CREATE', template, templateParameters);
        } else {
            console.log(tl.loc('CreateStack', taskParameters.templateFile, taskParameters.templateParametersFile));

            const request: awsCloudFormation.CreateStackInput = {
                StackName: taskParameters.stackName,
                OnFailure: taskParameters.onFailure,
                Parameters: templateParameters,
                TemplateBody: template,
                RoleARN: taskParameters.roleARN
            };

            if (taskParameters.notificationARNs && taskParameters.notificationARNs.length > 0) {
                request.NotificationARNs = taskParameters.notificationARNs;
            }
            if (taskParameters.resourceTypes && taskParameters.resourceTypes.length > 0) {
                request.ResourceTypes = taskParameters.resourceTypes;
            }

            try {
                const response: awsCloudFormation.CreateStackOutput = await this.cloudFormationClient.createStack(request).promise();
                tl.debug(`Stack id ${response.StackId}`);
                await this.waitForStackCreation(request.StackName);
                return response.StackId;
            } catch (err) {
                console.error(tl.loc('StackCreateRequestFailed', err.message), err);
                throw err;
            }
        }
    }

    private static async updateStack(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) : Promise<void> {
        console.log(tl.loc('UpdateStack', taskParameters.templateFile, taskParameters.templateParametersFile));

        let template: string;
        let templateParameters: awsCloudFormation.Parameters;

        try {
            template = await this.loadTemplateFile(taskParameters.templateFile);
            if (taskParameters.templateParametersFile) {
                templateParameters = await this.loadParametersFromFile(taskParameters.templateParametersFile);
            }
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        if (taskParameters.useChangeset) {
            console.log(tl.loc('UpdateStackWithChangeset', taskParameters.templateFile, taskParameters.templateParametersFile, taskParameters.changesetName));
            await this.createOrUpdateWithChangeset(taskParameters, 'UPDATE', template, templateParameters);
        } else {
            const request: awsCloudFormation.UpdateStackInput = {
                StackName: taskParameters.stackName,
                Parameters: templateParameters,
                TemplateBody: template,
                RoleARN: taskParameters.roleARN
            };

            if (taskParameters.notificationARNs && taskParameters.notificationARNs.length > 0) {
                request.NotificationARNs = taskParameters.notificationARNs;
            }
            if (taskParameters.resourceTypes && taskParameters.resourceTypes.length > 0) {
                request.ResourceTypes = taskParameters.resourceTypes;
            }

            try {
                const response: awsCloudFormation.UpdateStackOutput = await this.cloudFormationClient.updateStack(request).promise();
                await this.waitForStackUpdate(request.StackName);
            } catch (err) {
                // if there were no changes, a validation error is thrown which we want to suppress
                // rather than erroring out and failing the build
                if (err.code.search(/ValidationError/) !== -1 && err.message.search(/^No updates are to be performed./) !== -1) {
                    tl.warning(tl.loc('NoWorkToDo'));
                    return;
                }

                console.error(tl.loc('StackUpdateRequestFailed', err.message), err);
                throw err;
            }
        }
    }

    private static async createOrUpdateWithChangeset(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters,
                                                     changesetType: string,
                                                     templateBody: string,
                                                     templateParameters: awsCloudFormation.Parameters) : Promise<string> {

        const request: awsCloudFormation.CreateChangeSetInput = {
            ChangeSetName: taskParameters.changesetName,
            ChangeSetType: changesetType,
            StackName: taskParameters.stackName,
            Parameters: templateParameters,
            TemplateBody: templateBody,
            Description: taskParameters.description,
            RoleARN: taskParameters.roleARN
        };

        if (taskParameters.notificationARNs && taskParameters.notificationARNs.length > 0) {
            request.NotificationARNs = taskParameters.notificationARNs;
        }
        if (taskParameters.resourceTypes && taskParameters.resourceTypes.length > 0) {
            request.ResourceTypes = taskParameters.resourceTypes;
        }

        try {
            const response: awsCloudFormation.CreateChangeSetOutput = await this.cloudFormationClient.createChangeSet(request).promise();

            tl.debug(`Change set id ${response.Id}, stack id ${response.StackId}`);
            await this.waitForChangeSetCreation(request.ChangeSetName, response.StackId);

            if (taskParameters.autoExecute) {
                await this.executeChangeSet(taskParameters.changesetName, taskParameters.stackName);
            }

            return response.StackId;
        }  catch (err) {
            console.error(tl.loc('ChangesetCreationFailed', err.message), err);
            throw err;
        }
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

    private static async loadTemplateFile(templateFile: string): Promise<string> {
        console.log(tl.loc('LoadingTemplateFile', templateFile));
        const template = fs.readFileSync(templateFile, 'utf8');
        tl.debug('Successfully loaded template file');
        return template;
    }

    private static async loadParametersFromFile(parametersFile: string): Promise<awsCloudFormation.Parameters> {
        console.log(tl.loc('LoadingTemplateParameterFile', parametersFile));
        const templateParameters = JSON.parse(fs.readFileSync(parametersFile, 'utf8'));
        tl.debug('Successfully loaded template file');
        return templateParameters;
    }

    private static async waitForStackCreation(stackName: string) : Promise<void> {

        return new Promise<void>((resolve, reject) => {
            console.log(tl.loc('WaitingForStack', stackName));

            this.cloudFormationClient.waitFor('stackCreateComplete',
                                              { StackName: stackName },
                                              function(err: AWSError, data: awsCloudFormation.DescribeStacksOutput) {
                if (err) {
                    throw new Error(tl.loc('StackCreationFailed', stackName, err.message));
                } else {
                    console.log(tl.loc('StackCreated', stackName));
                }
            });
        });
    }

    private static async waitForStackUpdate(stackName: string) : Promise<void> {

        return new Promise<void>((resolve, reject) => {
            console.log(tl.loc('WaitingForStack', stackName));

            this.cloudFormationClient.waitFor('stackUpdateComplete',
                                              { StackName: stackName },
                                              function(err: AWSError, data: awsCloudFormation.DescribeStacksOutput) {
                if (err) {
                    throw new Error(tl.loc('StackUpdateFailed', stackName, err.message));
                } else {
                    console.log(tl.loc('StackUpdated', stackName));
                }
            });
        });
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

}
