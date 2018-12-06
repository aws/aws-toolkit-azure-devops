/*
  Copyright 2017-2018 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import yaml = require('js-yaml');
import CloudFormation = require('aws-sdk/clients/cloudformation');
import S3 = require('aws-sdk/clients/s3');
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './CreateOrUpdateStackTaskParameters';
import { CloudFormationUtils } from 'cloudformationutils/cloudformationutils';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        await this.createServiceClients();

        let stackId: string = await this.testStackExists(this.taskParameters.stackName);
        if (stackId) {
            console.log(tl.loc('StackExists'));

            if (this.taskParameters.templateSource === TaskParameters.usePreviousTemplate) {
                console.log(tl.loc('UpdatingStackWithPreviousTemplate'));
            }

            if (this.taskParameters.useChangeSet) {
                stackId = await this.createOrUpdateWithChangeSet('UPDATE');
            } else {
                await this.updateStack();
            }
        } else {
            console.log(tl.loc('StackDoesNotExist'));

            if (this.taskParameters.templateSource === TaskParameters.usePreviousTemplate) {
                throw new Error(tl.loc('UsePreviousTemplateIsInvalidWhenCreatingStack'));
            }

            if (this.taskParameters.useChangeSet) {
                stackId = await this.createOrUpdateWithChangeSet('CREATE');
            } else {
                stackId = await this.createStack();
            }
        }

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable));
            tl.setVariable(this.taskParameters.outputVariable, stackId);
        }

        if (this.taskParameters.captureStackOutputs !== TaskParameters.ignoreStackOutputs) {
            await CloudFormationUtils.captureStackOutputs(this.cloudFormationClient,
                                                          this.taskParameters.stackName,
                                                          this.taskParameters.captureStackOutputs === TaskParameters.stackOutputsAsJson,
                                                          this.taskParameters.captureAsSecuredVars);
        } else {
            console.log(tl.loc('SkippingStackOutputsProcessing'));
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.stackName, stackId));
    }

    private cloudFormationClient: CloudFormation;
    private s3Client: S3;

    private async createServiceClients(): Promise<void> {

        const cfnOpts: CloudFormation.ClientConfiguration = {
            apiVersion: '2010-05-15'
        };
        this.cloudFormationClient = await SdkUtils.createAndConfigureSdkClient(CloudFormation, cfnOpts, this.taskParameters, tl.debug);

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01'
        };
        this.s3Client = await SdkUtils.createAndConfigureSdkClient(S3, s3Opts, this.taskParameters, tl.debug);
    }

    private async createStack() : Promise<string> {

        const request: CloudFormation.CreateStackInput = {
            StackName: this.taskParameters.stackName,
            OnFailure: this.taskParameters.onFailure,
            RoleARN: this.taskParameters.roleARN
        };

        switch (this.taskParameters.templateSource) {
            case TaskParameters.fileSource: {
                if (this.taskParameters.s3BucketName) {
                    request.TemplateURL = await this.uploadTemplateFile(this.taskParameters.templateFile, this.taskParameters.s3BucketName);
                } else {
                    request.TemplateBody = await this.loadTemplateFile(this.taskParameters.templateFile);
                }
            }
            break;

            case TaskParameters.urlSource: {
                request.TemplateURL = this.taskParameters.templateUrl;
            }
            break;

            case TaskParameters.s3Source: {
                // sync call
                request.TemplateURL = await SdkUtils.getPresignedUrl(this.s3Client, 'getObject', this.taskParameters.s3BucketName, this.taskParameters.s3ObjectKey);
            }
            break;
        }

        request.Parameters = await this.loadTemplateParameters();

        console.log(tl.loc('CreateStack', this.taskParameters.templateFile));

        request.NotificationARNs = this.getNotificationArns(this.taskParameters.notificationARNs);
        request.ResourceTypes = this.getResourceTypes(this.taskParameters.resourceTypes);
        request.Capabilities = this.getCapabilities(this.taskParameters.capabilityIAM, this.taskParameters.capabilityNamedIAM, this.taskParameters.capabilityAutoExpand);
        request.Tags = this.getTags(this.taskParameters.tags);

        if (this.taskParameters.monitorRollbackTriggers) {
            request.RollbackConfiguration = {
                MonitoringTimeInMinutes: this.taskParameters.monitoringTimeInMinutes,
                RollbackTriggers: this.constructRollbackTriggerCollection(this.taskParameters.rollbackTriggerARNs)
            };
        }

        try {
            const response: CloudFormation.CreateStackOutput = await this.cloudFormationClient.createStack(request).promise();
            tl.debug(`Stack id ${response.StackId}`);
            await this.waitForStackCreation(request.StackName);
            return response.StackId;
        } catch (err) {
            console.error(tl.loc('StackCreateRequestFailed', err.message), err);
            throw err;
        }
    }

    private async updateStack() : Promise<void> {
        console.log(tl.loc('UpdateStack', this.taskParameters.templateFile));

        const request: CloudFormation.UpdateStackInput = {
            StackName: this.taskParameters.stackName,
            RoleARN: this.taskParameters.roleARN
        };

        switch (this.taskParameters.templateSource) {
            case TaskParameters.fileSource: {
                if (this.taskParameters.s3BucketName) {
                    request.TemplateURL = await this.uploadTemplateFile(this.taskParameters.templateFile, this.taskParameters.s3BucketName);
                } else {
                    request.TemplateBody = await this.loadTemplateFile(this.taskParameters.templateFile);
                }
            }
            break;

            case TaskParameters.urlSource: {
                request.TemplateURL = this.taskParameters.templateUrl;
            }
            break;

            case TaskParameters.s3Source: {
                // sync call
                request.TemplateURL = await SdkUtils.getPresignedUrl(this.s3Client, 'getObject', this.taskParameters.s3BucketName, this.taskParameters.s3ObjectKey);
            }
            break;

            case TaskParameters.usePreviousTemplate: {
                request.UsePreviousTemplate = true;
            }
        }

        request.Parameters = await this.loadTemplateParameters();

        request.NotificationARNs = this.getNotificationArns(this.taskParameters.notificationARNs);
        request.ResourceTypes = this.getResourceTypes(this.taskParameters.resourceTypes);
        request.Capabilities = this.getCapabilities(this.taskParameters.capabilityIAM, this.taskParameters.capabilityNamedIAM, this.taskParameters.capabilityAutoExpand);
        request.Tags = this.getTags(this.taskParameters.tags);

        if (this.taskParameters.monitorRollbackTriggers) {
            request.RollbackConfiguration = {
                MonitoringTimeInMinutes: this.taskParameters.monitoringTimeInMinutes,
                RollbackTriggers: this.constructRollbackTriggerCollection(this.taskParameters.rollbackTriggerARNs)
            };
        }

        try {
            const response: CloudFormation.UpdateStackOutput = await this.cloudFormationClient.updateStack(request).promise();
            await this.waitForStackUpdate(request.StackName);
        } catch (err) {
            if (!this.isNoWorkToDoValidationError(err.code, err.message)) {
                console.error(tl.loc('StackUpdateRequestFailed', err.message), err);
                throw err;
            }
        }
    }

    private async createOrUpdateWithChangeSet(changesetType: string) : Promise<string> {

        const changeSetExists = await this.testChangeSetExists(this.taskParameters.changeSetName, this.taskParameters.stackName);
        if (changeSetExists) {
            await this.deleteExistingChangeSet(this.taskParameters.changeSetName, this.taskParameters.stackName);
        }

        const request: CloudFormation.CreateChangeSetInput = {
            ChangeSetName: this.taskParameters.changeSetName,
            ChangeSetType: changesetType,
            StackName: this.taskParameters.stackName,
            Description: this.taskParameters.description,
            RoleARN: this.taskParameters.roleARN
        };

        switch (this.taskParameters.templateSource) {
            case TaskParameters.fileSource: {
                if (this.taskParameters.s3BucketName) {
                    request.TemplateURL = await this.uploadTemplateFile(this.taskParameters.templateFile, this.taskParameters.s3BucketName);
                } else {
                    request.TemplateBody = await this.loadTemplateFile(this.taskParameters.templateFile);
                }
            }
            break;

            case TaskParameters.urlSource: {
                request.TemplateURL = this.taskParameters.templateUrl;
            }
            break;

            case TaskParameters.s3Source: {
                // sync call
                request.TemplateURL = await SdkUtils.getPresignedUrl(this.s3Client, 'getObject', this.taskParameters.s3BucketName, this.taskParameters.s3ObjectKey);
            }
            break;

            // already validated that stack exists and so this mode is acceptable
            case TaskParameters.usePreviousTemplate: {
                request.UsePreviousTemplate = true;
            }
        }

        request.Parameters = await this.loadTemplateParameters();

        request.NotificationARNs = this.getNotificationArns(this.taskParameters.notificationARNs);
        request.ResourceTypes = this.getResourceTypes(this.taskParameters.resourceTypes);
        request.Capabilities = this.getCapabilities(this.taskParameters.capabilityIAM, this.taskParameters.capabilityNamedIAM, this.taskParameters.capabilityAutoExpand);
        request.Tags = this.getTags(this.taskParameters.tags);

        if (this.taskParameters.monitorRollbackTriggers) {
            request.RollbackConfiguration = {
                MonitoringTimeInMinutes: this.taskParameters.monitoringTimeInMinutes,
                RollbackTriggers: this.constructRollbackTriggerCollection(this.taskParameters.rollbackTriggerARNs)
            };
        }

        try {
            // note that we can create a change set with no changes, but when we wait for completion it's then
            // that we get a validation failure, which we check for inside waitForChangeSetCreation
            console.log(tl.loc('CreatingChangeSet', changesetType, this.taskParameters.changeSetName));
            const response: CloudFormation.CreateChangeSetOutput = await this.cloudFormationClient.createChangeSet(request).promise();

            tl.debug(`Change set id ${response.Id}, stack id ${response.StackId}`);
            const changesToApply = await this.waitForChangeSetCreation(request.ChangeSetName, request.StackName);
            if (changesToApply && this.taskParameters.autoExecuteChangeSet) {
                await this.executeChangeSet(this.taskParameters.changeSetName, this.taskParameters.stackName);
            }
            return response.StackId;
        } catch (err) {
            console.error(tl.loc('ChangeSetCreationFailed', err.message), err);
            throw err;
        }
    }

    private constructRollbackTriggerCollection(rollbackTriggerArns: string[]): CloudFormation.RollbackTrigger[] {
        const triggers: CloudFormation.RollbackTrigger[] = [];

        rollbackTriggerArns.forEach((rta) => {
            console.log(tl.loc('AddingRollbackTrigger', rta));

            // currently AWS::CloudWatch::Alarm is the only supported type; in future if this is
            // extended we can parse the trigger arn and set the type appropriately
            triggers.push({
                Arn: rta,
                Type: 'AWS::CloudWatch::Alarm'
            });
        });

        return triggers;
    }

    private async executeChangeSet(changeSetName: string, stackName: string) : Promise<void> {
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

    private async deleteExistingChangeSet(changeSetName: string, stackName: string): Promise<void> {
        try {
            console.log(tl.loc('DeletingExistingChangeSet', changeSetName, stackName));
            await this.cloudFormationClient.deleteChangeSet({ ChangeSetName: changeSetName, StackName: stackName }).promise();
        } catch (err) {
            throw new Error(tl.loc('FailedToDeleteChangeSet', err.message));
        }
    }

    private getCapabilities(capabilityIAM: boolean, capabilityNamedIAM: boolean, capabilityAutoExpand: boolean) {

        const arr = [];

        if (capabilityIAM) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_IAM'));
            arr.push('CAPABILITY_IAM');
        }
        if (capabilityNamedIAM) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_NAMED_IAM'));
            arr.push('CAPABILITY_NAMED_IAM');
        }
        if (capabilityAutoExpand) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_AUTO_EXPAND'));
            arr.push('CAPABILITY_AUTO_EXPAND');
        }

        return (arr && arr.length > 0) ? arr : null;
    }

    private getTags(tags: string[]): CloudFormation.Tags {

        let arr: CloudFormation.Tags;

        if (tags && tags.length > 0) {
            arr = [];
            tags.forEach((t) => {
                const kvp = t.split('=');
                const key = kvp[0].trim();
                const val = kvp[1].trim();
                console.log(tl.loc('AddingTag', key, val));
                arr.push({
                    Key: key,
                    Value: val
                });
            });
        }

        return arr;
    }

    private getNotificationArns(notificationARNs: string[]) {
        // Supplying an empty array is different (to the service) than a null
        // array. When splitting our task parameters, we get an empty array.
        if (notificationARNs && notificationARNs.length > 0) {
            return notificationARNs;
        }

        return null;
    }

    private getResourceTypes(resourceTypes: string []) {
        // Supplying an empty array is different (to the service) than a null
        // array. When splitting our task parameters, we get an empty array.
        if (resourceTypes && resourceTypes.length > 0) {
            return resourceTypes;
        }

        return null;
    }

    private async loadTemplateFile(templateFile: string): Promise<string> {
        console.log(tl.loc('LoadingTemplateFile', templateFile));
        if (!tl.exist(templateFile)) {
            throw new Error(tl.loc('TemplateFileDoesNotExist', templateFile));
        }

        try {
            const template = fs.readFileSync(templateFile, 'utf8');
            tl.debug('Successfully loaded template file');
            return template;
        } catch (err) {
            throw new Error(tl.loc('FailedToLoadTemplateFile', err));
        }
    }

    private async uploadTemplateFile(templateFile: string, s3BucketName: string): Promise<string> {
        const fileBuffer = fs.createReadStream(templateFile);
        const objectKey = path.basename(templateFile);

        console.log(tl.loc('UploadingTemplate', templateFile, objectKey, s3BucketName));
        try {
            await this.s3Client.upload({
                Bucket: s3BucketName,
                Key: objectKey,
                Body: fileBuffer
            }).promise();

            const templateUrl = await SdkUtils.getPresignedUrl(this.s3Client, 'getObject', s3BucketName, objectKey);
            return templateUrl;
        } catch (err) {
            throw new Error(tl.loc('TemplateUploadFailed', err));
        }
    }

    private loadTemplateParameters(): CloudFormation.Parameters {

        let parsedParameters: CloudFormation.Parameters;

        switch (this.taskParameters.templateParametersSource) {
            case TaskParameters.loadTemplateParametersFromFile: {
                parsedParameters = this.loadParametersFromFile(this.taskParameters.templateParametersFile);
            }
            break;

            case TaskParameters.loadTemplateParametersInline: {
                console.log(tl.loc('LoadingTemplateParameters'));
                parsedParameters = this.parseParameters(this.taskParameters.templateParameters);
            }
            break;
        }

        if (parsedParameters) {
            console.log(tl.loc('ParametersLoadSucceeded'));
        }
        return parsedParameters;
    }

    private loadParametersFromFile(parametersFile: string): CloudFormation.Parameters {
        if (!parametersFile) {
            console.log(tl.loc('NoParametersFileSpecified'));
            return null;
        }

        console.log(tl.loc('LoadingTemplateParametersFile', parametersFile));
        if (!tl.exist(parametersFile)) {
            throw new Error(tl.loc('ParametersFileDoesNotExist', parametersFile));
        }

        const parameterContent = fs.readFileSync(parametersFile, 'utf8');
        const templateParameters = this.parseParameters(parameterContent);
        return templateParameters;
    }

    private parseParameters(parameters: string): CloudFormation.Parameters {

        let templateParameters;
        try {
            tl.debug('Attempting parse as json content');
            templateParameters = JSON.parse(parameters);
        } catch (err) {
            try {
                tl.debug('Json parse failed, attempting yaml.');
                templateParameters = yaml.safeLoad(parameters);
            } catch (errorYamlLoad) {
                tl.debug('Yaml parse failed, cannot determine file content format.');
                throw new Error(tl.loc('ParametersLoadFailed'));
            }
        }

        tl.debug('Successfully parsed template parameters');
        return templateParameters;
    }

    // If there were no changes, a validation error is thrown which we want to suppress
    // (issue #28) instead of erroring out and failing the build. The only way to determine
    // this is to inspect the message in conjunction with the status code, and over time
    // there has been some variance in service behavior based on how we attempted to make the
    // change. So now detect either of the errors, and for either if the message indicates
    // a no-op.
    private isNoWorkToDoValidationError(errCodeOrStatus: string, errMessage: string): boolean {
        let noWorkToDo: boolean = false;
        const knownNoOpErrorMessages = [
            /^No updates are to be performed./,
            /^The submitted information didn't contain changes./
        ];

        try {
            if (errCodeOrStatus.search(/ValidationError/) !== -1 || errCodeOrStatus.search(/FAILED/) !== -1) {
                knownNoOpErrorMessages.forEach((element) => {
                    if (errMessage.search(element) !== -1) {
                        noWorkToDo = true;
                    }
                });
            }
            if (noWorkToDo) {
                if (this.taskParameters.warnWhenNoWorkNeeded) {
                    tl.warning(tl.loc('NoWorkToDo'));
                }
                return true;
            }
        // tslint:disable-next-line:no-empty
        } catch (err) {
        }

        return false;
    }

    private async waitForStackCreation(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackCreation', stackName));
        try {
            const parms: any = this.setWaiterParams(stackName, this.taskParameters.timeoutInMins);
            await this.cloudFormationClient.waitFor('stackCreateComplete', parms).promise();
            console.log(tl.loc('StackCreated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackCreationFailed', stackName, err.message));
        }
    }

    private async waitForStackUpdate(stackName: string) : Promise<void> {
        console.log(tl.loc('WaitingForStackUpdate', stackName));
        try {
            const parms: any = this.setWaiterParams(stackName, this.taskParameters.timeoutInMins);
            await this.cloudFormationClient.waitFor('stackUpdateComplete', parms).promise();
            console.log(tl.loc('StackUpdated', stackName));
        } catch (err) {
            throw new Error(tl.loc('StackUpdateFailed', stackName, err.message));
        }
    }

    private async waitForChangeSetCreation(changeSetName: string, stackName: string) : Promise<boolean> {
        console.log(tl.loc('WaitingForChangeSetValidation', changeSetName, stackName));
        try {
            const parms: any = this.setWaiterParams(stackName, this.taskParameters.timeoutInMins, changeSetName);
            const response = await this.cloudFormationClient.waitFor('changeSetCreateComplete', parms).promise();
            console.log(tl.loc('ChangeSetValidated'));
        } catch (err) {
            // Inspect to see if the error was down to the service reporting (as an exception trapped
            // by the waiter) that the set has no changes. If that is the case, return a signal to
            // the caller that no work is needed rather than fail the task. This allows CI pipelines
            // with multiple stacks to be updated when some stacks have no changes.
            // https://github.com/aws/aws-vsts-tools/issues/28
            const response = await this.cloudFormationClient.describeChangeSet({ ChangeSetName: changeSetName, StackName: stackName }).promise();
            if (this.isNoWorkToDoValidationError(response.Status, response.StatusReason)) {
                return false;
            } else {
                throw new Error(tl.loc('ChangeSetValidationFailed', stackName, changeSetName, err.message));
            }
        }

        return true;
    }

    private setWaiterParams(stackName: string, timeout: number, changeSetName?: string): any {

        if (timeout !== TaskParameters.defaultTimeoutInMins) {
            console.log(tl.loc('SettingCustomTimeout', timeout));
        }

        const p: any = {
            StackName: stackName,
            $waiter: {
                maxAttempts: Math.round(timeout * 60 / 30)
            }
        };

        if (changeSetName) {
            p.ChangeSetName = changeSetName;
        }

        return p;
    }

    private async testStackExists(stackName: string): Promise<string> {
        console.log(tl.loc('CheckingForStackExistence', stackName));

        try {
            const response: CloudFormation.DescribeStacksOutput = await this.cloudFormationClient.describeStacks({
                StackName: stackName
            }).promise();
            if (response.Stacks && response.Stacks.length > 0) {
                return response.Stacks[0].StackId;
            }
        } catch (err) {
            console.log(tl.loc('StackLookupFailed', this.taskParameters.stackName, err));
        }

        return null;
    }

    // Stacks 'created' with a change set are not fully realised until the change set
    // executes, so we inspect whether resources exist in order to know which kind
    // of 'waiter' to use (create complete, update complete) when running a stack update.
    // It's not enough to know that the stack exists.
    private async testStackHasResources(stackName: string): Promise<boolean> {
        try {
            const response = await this.cloudFormationClient.describeStackResources({ StackName: stackName }).promise();
            return (response.StackResources && response.StackResources.length > 0);
        } catch (err) {
            return false;
        }
    }

    private async testChangeSetExists(changeSetName: string, stackName: string): Promise<boolean> {
        try {
            console.log(tl.loc('CheckingForExistingChangeSet', changeSetName, stackName));
            const response = await this.cloudFormationClient.describeChangeSet({ ChangeSetName: changeSetName, StackName: stackName }).promise();
            console.log(tl.loc('ChangeSetExists', changeSetName, response.Status));
            return true;
        } catch (err) {
            console.log(tl.loc('ChangeSetLookupFailed', changeSetName, err.message));
        }

        return false;
    }
}
