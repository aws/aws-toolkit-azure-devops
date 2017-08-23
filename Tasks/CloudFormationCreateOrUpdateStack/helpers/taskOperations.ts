/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

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
            console.log(tl.loc('StackExists'));
            await this.updateStack(taskParameters);
        } else {
            console.log(tl.loc('StackDoesNotExist'));
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

    private static async testStackExists(stackName: string): Promise<string> {
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

    // Stacks 'created' with a change set are not fully realised until the change set
    // executes, so we inspect whether resources exist in order to know which kind
    // of 'waiter' to use (create complete, update complete) when running a stack update.
    // It's not enough to know that the stack exists.
    private static async testStackHasResources(stackName: string): Promise<boolean> {
        try {
            const response = await this.cloudFormationClient.describeStackResources({ StackName: stackName }).promise();
            return (response.StackResources && response.StackResources.length > 0);
        } catch (err) {
            return false;
        }
    }

    private static async testChangeSetExists(changeSetName: string, stackName: string): Promise<boolean> {
        try {
            console.log(tl.loc('CheckingForExistingChangeSet', changeSetName, stackName));
            await this.cloudFormationClient.describeChangeSet({ ChangeSetName: changeSetName, StackName: stackName}).promise();
            return true;
        } catch (err) {
            tl.debug(`Test for change set ${changeSetName} for stack ${stackName} threw exception: ${err.message}, assuming change set does not exist`);
        }

        return false;
    }

    private static async createStack(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) : Promise<string> {

        let template: string;
        let templateParameters: awsCloudFormation.Parameters;

        try {
            template = await this.loadTemplateFile(taskParameters.templateFile);
            templateParameters = await this.loadParametersFromFile(taskParameters.templateParametersFile);
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        if (taskParameters.useChangeSet) {
            console.log(tl.loc('CreateStackWithChangeSet', taskParameters.templateFile, taskParameters.templateParametersFile, taskParameters.changeSetName));
            return await this.createOrUpdateWithChangeSet(taskParameters, 'CREATE', template, templateParameters);
        } else {
            console.log(tl.loc('CreateStack', taskParameters.templateFile, taskParameters.templateParametersFile));

            const request: awsCloudFormation.CreateStackInput = {
                StackName: taskParameters.stackName,
                OnFailure: taskParameters.onFailure,
                Parameters: templateParameters,
                TemplateBody: template,
                RoleARN: taskParameters.roleARN
            };

            request.NotificationARNs = this.getNotificationArns(taskParameters.notificationARNs);
            request.ResourceTypes = this.getResourceTypes(taskParameters.resourceTypes);
            request.Capabilities = this.getCapabilities(taskParameters.capabilityIAM, taskParameters.capabilityNamedIAM);

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
            templateParameters = await this.loadParametersFromFile(taskParameters.templateParametersFile);
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        if (taskParameters.useChangeSet) {
            console.log(tl.loc('UpdateStackWithChangeSet', taskParameters.templateFile, taskParameters.templateParametersFile, taskParameters.changeSetName));
            await this.createOrUpdateWithChangeSet(taskParameters, 'UPDATE', template, templateParameters);
        } else {
            const request: awsCloudFormation.UpdateStackInput = {
                StackName: taskParameters.stackName,
                Parameters: templateParameters,
                TemplateBody: template,
                RoleARN: taskParameters.roleARN
            };

            request.NotificationARNs = this.getNotificationArns(taskParameters.notificationARNs);
            request.ResourceTypes = this.getResourceTypes(taskParameters.resourceTypes);
            request.Capabilities = this.getCapabilities(taskParameters.capabilityIAM, taskParameters.capabilityNamedIAM);

            try {
                const response: awsCloudFormation.UpdateStackOutput = await this.cloudFormationClient.updateStack(request).promise();
                await this.waitForStackUpdate(request.StackName);
            } catch (err) {
                if (!this.isNoWorkToDoValidationError(err.code, err.message)) {
                    console.error(tl.loc('StackUpdateRequestFailed', err.message), err);
                    throw err;
                }
            }
        }
    }

    private static async createOrUpdateWithChangeSet(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters,
                                                     changesetType: string,
                                                     templateBody: string,
                                                     templateParameters: awsCloudFormation.Parameters) : Promise<string> {

        const changeSetExists = await this.testChangeSetExists(taskParameters.changeSetName, taskParameters.stackName);
        if (changeSetExists) {
            await this.deleteExistingChangeSet(taskParameters.changeSetName, taskParameters.stackName);
        }

        const request: awsCloudFormation.CreateChangeSetInput = {
            ChangeSetName: taskParameters.changeSetName,
            ChangeSetType: changesetType,
            StackName: taskParameters.stackName,
            Parameters: templateParameters,
            TemplateBody: templateBody,
            Description: taskParameters.description,
            RoleARN: taskParameters.roleARN
        };

        request.NotificationARNs = this.getNotificationArns(taskParameters.notificationARNs);
        request.ResourceTypes = this.getResourceTypes(taskParameters.resourceTypes);
        request.Capabilities = this.getCapabilities(taskParameters.capabilityIAM, taskParameters.capabilityNamedIAM);

        try {
            console.log(tl.loc('CreatingChangeSet', changesetType, taskParameters.changeSetName));
            const response: awsCloudFormation.CreateChangeSetOutput = await this.cloudFormationClient.createChangeSet(request).promise();

            tl.debug(`Change set id ${response.Id}, stack id ${response.StackId}`);
            await this.waitForChangeSetCreation(request.ChangeSetName, request.StackName);
            if (taskParameters.autoExecuteChangeSet) {
                await this.executeChangeSet(taskParameters.changeSetName, taskParameters.stackName);
            }
            return response.StackId;
        }  catch (err) {
            if (!this.isNoWorkToDoValidationError(err.code, err.message)) {
                console.error(tl.loc('ChangeSetCreationFailed', err.message), err);
                throw err;
            }
        }
    }

    private static async executeChangeSet(changeSetName: string, stackName: string) : Promise<void> {
        console.log(tl.loc('ExecutingChangeSet', changeSetName, stackName));

        try {
            await this.cloudFormationClient.executeChangeSet({
                ChangeSetName: changeSetName,
                StackName: stackName
            }).promise();

            if (await this.testStackHasResources(stackName)) {
                await this.waitForStackUpdate(stackName);
            } else {
                await this.waitForStackCreation(stackName);
            }
        } catch (err) {
            console.error(tl.loc('ExecuteChangeSetFailed', err.message), err);
            throw err;
        }
    }

    private static async deleteExistingChangeSet(changeSetName: string, stackName: string): Promise<void> {
        try {
            console.log(tl.loc('DeletingExistingChangeSet', changeSetName, stackName));
            await this.cloudFormationClient.deleteChangeSet({ ChangeSetName: changeSetName, StackName: stackName }).promise();
        } catch (err) {
            throw new Error(tl.loc('FailedToDeleteChangeSet', err.message));
        }
    }

    private static getCapabilities(capabilityIAM: boolean, capabilityNamedIAM: boolean) {

        const arr = [];

        if (capabilityIAM) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_IAM'));
            arr.push('CAPABILITY_IAM');
        }
        if (capabilityNamedIAM) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_NAMED_IAM'));
            arr.push('CAPABILITY_NAMED_IAM');
        }

        return (arr && arr.length > 0) ? arr : null;
    }

    private static getNotificationArns(notificationARNs: string []) {
        // Supplying an empty array is different (to the service) than a null
        // array. When splitting our task parameters, we get an empty array.
        if (notificationARNs && notificationARNs.length > 0) {
            return notificationARNs;
        }

        return null;
    }

    private static getResourceTypes(resourceTypes: string []) {
        // Supplying an empty array is different (to the service) than a null
        // array. When splitting our task parameters, we get an empty array.
        if (resourceTypes && resourceTypes.length > 0) {
            return resourceTypes;
        }

        return null;
    }

    private static async loadTemplateFile(templateFile: string): Promise<string> {
        console.log(tl.loc('LoadingTemplateFile', templateFile));
        if (!tl.exist(templateFile)) {
            throw new Error(tl.loc('TemplateFileDoesNotExist', templateFile));
        }
        const template = fs.readFileSync(templateFile, 'utf8');
        tl.debug('Successfully loaded template file');
        return template;
    }

    private static async loadParametersFromFile(parametersFile: string): Promise<awsCloudFormation.Parameters> {
        if (!parametersFile) {
            console.log(tl.loc('NoParametersFileSpecified'));
            return null;
        }
        console.log(tl.loc('LoadingTemplateParametersFile', parametersFile));
        if (!tl.exist(parametersFile)) {
            throw new Error(tl.loc('ParametersFileDoesNotExist', parametersFile));
        }
        const templateParameters = JSON.parse(fs.readFileSync(parametersFile, 'utf8'));
        tl.debug('Successfully loaded template parameters file');
        return templateParameters;
    }

    // If there were no changes, a validation error is thrown which we want to suppress
    // rather than erroring out and failing the build.
    private static isNoWorkToDoValidationError(errCode: string, errMessage: string): boolean {
        try {
            if (errCode.search(/ValidationError/) !== -1 && errMessage.search(/^No updates are to be performed./) !== -1) {
                tl.warning(tl.loc('NoWorkToDo'));
                return true;
            }
        // tslint:disable-next-line:no-empty
        } catch (err) {
        }

        return false;
    }

    private static async waitForStackCreation(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackCreation', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackCreateComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackCreated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackCreationFailed', stackName, err.message));
        }
    }

    private static async waitForStackUpdate(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackUpdate', stackName));
        try {
            await this.cloudFormationClient.waitFor('stackUpdateComplete', { StackName: stackName }).promise();
            console.log(tl.loc('StackUpdated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackUpdateFailed', stackName, err.message));
        }
    }

    private static async waitForChangeSetCreation(changeSetName: string, stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForChangeSetValidation', changeSetName, stackName));
        try {
            await this.cloudFormationClient.waitFor('changeSetCreateComplete',
                                                    { ChangeSetName: changeSetName, StackName: stackName }).promise();
            console.log(tl.loc('ChangeSetValidated'));
        } catch (err) {
            throw new Error(tl.loc('ChangeSetValidationFailed', changeSetName, err.message));
        }
    }

}
