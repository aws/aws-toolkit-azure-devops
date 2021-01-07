/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import CloudFormation = require('aws-sdk/clients/cloudformation')
import S3 = require('aws-sdk/clients/s3')
import * as tl from 'azure-pipelines-task-lib/task'
import {
    captureStackOutputs,
    setWaiterParams,
    testChangeSetExists,
    testStackExists,
    testStackHasResources,
    waitForStackCreation,
    waitForStackUpdate
} from 'Common/cloudformationutils'
import { SdkUtils } from 'Common/sdkutils'
import fs = require('fs')
import yaml = require('js-yaml')
import path = require('path')
import {
    fileSource,
    ignoreStackOutputs,
    loadTemplateParametersFromFile,
    loadTemplateParametersInline,
    s3Source,
    stackOutputsAsJson,
    TaskParameters,
    urlSource,
    usePreviousTemplate
} from './TaskParameters'

export class TaskOperations {
    public constructor(
        public readonly cloudFormationClient: CloudFormation,
        public readonly s3Client: S3,
        public readonly taskParameters: TaskParameters
    ) {}

    public async execute(): Promise<void> {
        let stackId: string = await testStackExists(this.cloudFormationClient, this.taskParameters.stackName)
        if (stackId) {
            console.log(tl.loc('StackExists'))

            if (this.taskParameters.templateSource === usePreviousTemplate) {
                console.log(tl.loc('UpdatingStackWithPreviousTemplate'))
            }

            if (this.taskParameters.useChangeSet) {
                stackId = await this.createOrUpdateWithChangeSet('UPDATE')
            } else {
                await this.updateStack()
            }
        } else {
            console.log(tl.loc('StackDoesNotExist'))

            if (this.taskParameters.templateSource === usePreviousTemplate) {
                throw new Error(tl.loc('UsePreviousTemplateIsInvalidWhenCreatingStack'))
            }

            if (this.taskParameters.useChangeSet) {
                stackId = await this.createOrUpdateWithChangeSet('CREATE')
            } else {
                stackId = await this.createStack()
            }
        }

        if (this.taskParameters.outputVariable) {
            console.log(tl.loc('SettingOutputVariable', this.taskParameters.outputVariable))
            tl.setVariable(this.taskParameters.outputVariable, stackId)
        }

        if (this.taskParameters.captureStackOutputs !== ignoreStackOutputs) {
            await captureStackOutputs(
                this.cloudFormationClient,
                this.taskParameters.stackName,
                this.taskParameters.captureStackOutputs === stackOutputsAsJson,
                this.taskParameters.captureAsSecuredVars
            )
        } else {
            console.log(tl.loc('SkippingStackOutputsProcessing'))
        }

        console.log(tl.loc('TaskCompleted', this.taskParameters.stackName, stackId))
    }

    private async createStack(): Promise<string> {
        const request: CloudFormation.CreateStackInput = {
            StackName: this.taskParameters.stackName,
            OnFailure: this.taskParameters.onFailure,
            RoleARN: this.taskParameters.roleARN
        }

        switch (this.taskParameters.templateSource) {
            case fileSource:
                if (this.taskParameters.s3BucketName) {
                    request.TemplateURL = await this.uploadTemplateFile(
                        this.taskParameters.templateFile,
                        this.taskParameters.s3BucketName
                    )
                } else {
                    request.TemplateBody = await this.loadTemplateFile(this.taskParameters.templateFile)
                }
                break

            case urlSource:
                request.TemplateURL = this.taskParameters.templateUrl
                break

            case s3Source:
                // sync call
                request.TemplateURL = await SdkUtils.getPresignedUrl(
                    this.s3Client,
                    'getObject',
                    this.taskParameters.s3BucketName,
                    this.taskParameters.s3ObjectKey
                )
                break
        }

        request.Parameters = this.loadTemplateParameters()

        console.log(tl.loc('CreateStack', this.taskParameters.templateFile))

        request.NotificationARNs = this.getNotificationArns(this.taskParameters.notificationARNs)
        request.ResourceTypes = this.getResourceTypes(this.taskParameters.resourceTypes)
        request.Capabilities = this.getCapabilities(
            this.taskParameters.capabilityIAM,
            this.taskParameters.capabilityNamedIAM,
            this.taskParameters.capabilityAutoExpand
        )
        request.Tags = SdkUtils.getTags<CloudFormation.Tag[]>(this.taskParameters.tags)

        if (this.taskParameters.monitorRollbackTriggers) {
            request.RollbackConfiguration = {
                MonitoringTimeInMinutes: this.taskParameters.monitoringTimeInMinutes,
                RollbackTriggers: this.constructRollbackTriggerCollection(this.taskParameters.rollbackTriggerARNs)
            }
        }

        try {
            const response: CloudFormation.CreateStackOutput = await this.cloudFormationClient
                .createStack(request)
                .promise()
            tl.debug(`Stack id ${response.StackId}`)
            await waitForStackCreation(this.cloudFormationClient, request.StackName, this.taskParameters.timeoutInMins)

            if (!response.StackId) {
                return ''
            }

            return response.StackId
        } catch (err) {
            console.error(tl.loc('StackCreateRequestFailed', (err as Error).message), err)
            throw err
        }
    }

    private async updateStack(): Promise<void> {
        console.log(tl.loc('UpdateStack', this.taskParameters.templateFile))

        const request: CloudFormation.UpdateStackInput = {
            StackName: this.taskParameters.stackName,
            RoleARN: this.taskParameters.roleARN
        }

        switch (this.taskParameters.templateSource) {
            case fileSource:
                {
                    if (this.taskParameters.s3BucketName) {
                        request.TemplateURL = await this.uploadTemplateFile(
                            this.taskParameters.templateFile,
                            this.taskParameters.s3BucketName
                        )
                    } else {
                        request.TemplateBody = await this.loadTemplateFile(this.taskParameters.templateFile)
                    }
                }
                break

            case urlSource:
                {
                    request.TemplateURL = this.taskParameters.templateUrl
                }
                break

            case s3Source:
                {
                    // sync call
                    request.TemplateURL = await SdkUtils.getPresignedUrl(
                        this.s3Client,
                        'getObject',
                        this.taskParameters.s3BucketName,
                        this.taskParameters.s3ObjectKey
                    )
                }
                break

            case usePreviousTemplate: {
                request.UsePreviousTemplate = true
                break
            }
        }

        request.Parameters = this.loadTemplateParameters()

        request.NotificationARNs = this.getNotificationArns(this.taskParameters.notificationARNs)
        request.ResourceTypes = this.getResourceTypes(this.taskParameters.resourceTypes)
        request.Capabilities = this.getCapabilities(
            this.taskParameters.capabilityIAM,
            this.taskParameters.capabilityNamedIAM,
            this.taskParameters.capabilityAutoExpand
        )
        request.Tags = SdkUtils.getTags<CloudFormation.Tag[]>(this.taskParameters.tags)

        if (this.taskParameters.monitorRollbackTriggers) {
            request.RollbackConfiguration = {
                MonitoringTimeInMinutes: this.taskParameters.monitoringTimeInMinutes,
                RollbackTriggers: this.constructRollbackTriggerCollection(this.taskParameters.rollbackTriggerARNs)
            }
        }

        try {
            const response: CloudFormation.UpdateStackOutput = await this.cloudFormationClient
                .updateStack(request)
                .promise()
            await waitForStackUpdate(this.cloudFormationClient, request.StackName)
        } catch (err) {
            // tslint:disable-next-line: no-unsafe-any
            if (!this.isNoWorkToDoValidationError(err.code, err.message)) {
                console.error(tl.loc('StackUpdateRequestFailed', (err as Error).message), err)
                throw err
            }
        }
    }

    private async createOrUpdateWithChangeSet(changesetType: string): Promise<string> {
        const changeSetExists = await testChangeSetExists(
            this.cloudFormationClient,
            this.taskParameters.changeSetName,
            this.taskParameters.stackName
        )
        if (changeSetExists) {
            await this.deleteExistingChangeSet(this.taskParameters.changeSetName, this.taskParameters.stackName)
        }

        const request: CloudFormation.CreateChangeSetInput = {
            ChangeSetName: this.taskParameters.changeSetName,
            ChangeSetType: changesetType,
            StackName: this.taskParameters.stackName,
            RoleARN: this.taskParameters.roleARN
        }
        if (this.taskParameters.description) {
            request.Description = this.taskParameters.description
        }
        switch (this.taskParameters.templateSource) {
            case fileSource:
                if (this.taskParameters.s3BucketName) {
                    request.TemplateURL = await this.uploadTemplateFile(
                        this.taskParameters.templateFile,
                        this.taskParameters.s3BucketName
                    )
                } else {
                    request.TemplateBody = await this.loadTemplateFile(this.taskParameters.templateFile)
                }
                break

            case urlSource:
                request.TemplateURL = this.taskParameters.templateUrl
                break

            case s3Source:
                // sync call
                request.TemplateURL = await SdkUtils.getPresignedUrl(
                    this.s3Client,
                    'getObject',
                    this.taskParameters.s3BucketName,
                    this.taskParameters.s3ObjectKey
                )
                break

            // already validated that stack exists and so this mode is acceptable
            case usePreviousTemplate:
                request.UsePreviousTemplate = true
                break
        }

        request.Parameters = this.loadTemplateParameters()

        request.NotificationARNs = this.getNotificationArns(this.taskParameters.notificationARNs)
        request.ResourceTypes = this.getResourceTypes(this.taskParameters.resourceTypes)
        request.Capabilities = this.getCapabilities(
            this.taskParameters.capabilityIAM,
            this.taskParameters.capabilityNamedIAM,
            this.taskParameters.capabilityAutoExpand
        )
        request.Tags = SdkUtils.getTags<CloudFormation.Tag[]>(this.taskParameters.tags)

        if (this.taskParameters.monitorRollbackTriggers) {
            request.RollbackConfiguration = {
                MonitoringTimeInMinutes: this.taskParameters.monitoringTimeInMinutes,
                RollbackTriggers: this.constructRollbackTriggerCollection(this.taskParameters.rollbackTriggerARNs)
            }
        }

        try {
            // note that we can create a change set with no changes, but when we wait for completion it's then
            // that we get a validation failure, which we check for inside waitForChangeSetCreation
            console.log(tl.loc('CreatingChangeSet', changesetType, this.taskParameters.changeSetName))
            const response: CloudFormation.CreateChangeSetOutput = await this.cloudFormationClient
                .createChangeSet(request)
                .promise()

            tl.debug(`Change set id ${response.Id}, stack id ${response.StackId}`)
            const changesToApply = await this.waitForChangeSetCreation(request.ChangeSetName, request.StackName)
            if (changesToApply && this.taskParameters.autoExecuteChangeSet) {
                await this.executeChangeSet(this.taskParameters.changeSetName, this.taskParameters.stackName)
            }

            if (!response.StackId) {
                return ''
            }

            return response.StackId
        } catch (err) {
            console.error(tl.loc('ChangeSetCreationFailed', (err as Error).message), err)
            throw err
        }
    }

    private constructRollbackTriggerCollection(rollbackTriggerArns: string[]): CloudFormation.RollbackTrigger[] {
        const triggers: CloudFormation.RollbackTrigger[] = []

        rollbackTriggerArns.forEach(rta => {
            console.log(tl.loc('AddingRollbackTrigger', rta))

            // currently AWS::CloudWatch::Alarm is the only supported type; in future if this is
            // extended we can parse the trigger arn and set the type appropriately
            triggers.push({
                Arn: rta,
                Type: 'AWS::CloudWatch::Alarm'
            })
        })

        return triggers
    }

    private async executeChangeSet(changeSetName: string, stackName: string): Promise<void> {
        console.log(tl.loc('ExecutingChangeSet', changeSetName, stackName))

        try {
            await this.cloudFormationClient
                .executeChangeSet({
                    ChangeSetName: changeSetName,
                    StackName: stackName
                })
                .promise()

            if (await testStackHasResources(this.cloudFormationClient, stackName)) {
                await waitForStackUpdate(this.cloudFormationClient, stackName)
            } else {
                await waitForStackCreation(this.cloudFormationClient, stackName, this.taskParameters.timeoutInMins)
            }
        } catch (err) {
            console.error(tl.loc('ExecuteChangeSetFailed', (err as Error).message), err)
            throw err
        }
    }

    private async deleteExistingChangeSet(changeSetName: string, stackName: string): Promise<void> {
        try {
            console.log(tl.loc('DeletingExistingChangeSet', changeSetName, stackName))
            await this.cloudFormationClient
                .deleteChangeSet({ ChangeSetName: changeSetName, StackName: stackName })
                .promise()
        } catch (err) {
            throw new Error(tl.loc('FailedToDeleteChangeSet', (err as Error).message))
        }
    }

    private getCapabilities(
        capabilityIAM: boolean,
        capabilityNamedIAM: boolean,
        capabilityAutoExpand: boolean
    ): string[] | undefined {
        const arr = []

        if (capabilityIAM) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_IAM'))
            arr.push('CAPABILITY_IAM')
        }
        if (capabilityNamedIAM) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_NAMED_IAM'))
            arr.push('CAPABILITY_NAMED_IAM')
        }
        if (capabilityAutoExpand) {
            console.log(tl.loc('AddingCapability', 'CAPABILITY_AUTO_EXPAND'))
            arr.push('CAPABILITY_AUTO_EXPAND')
        }

        return arr && arr.length > 0 ? arr : undefined
    }

    private getNotificationArns(notificationARNs: string[]) {
        // Supplying an empty array is different (to the service) than a null
        // array. When splitting our task parameters, we get an empty array.
        if (notificationARNs && notificationARNs.length > 0) {
            return notificationARNs
        }

        return undefined
    }

    private getResourceTypes(resourceTypes: string[]) {
        // Supplying an empty array is different (to the service) than a null
        // array. When splitting our task parameters, we get an empty array.
        if (resourceTypes && resourceTypes.length > 0) {
            return resourceTypes
        }

        return undefined
    }

    private async loadTemplateFile(templateFile: string): Promise<string> {
        console.log(tl.loc('LoadingTemplateFile', templateFile))
        if (!tl.exist(templateFile)) {
            throw new Error(tl.loc('TemplateFileDoesNotExist', templateFile))
        }

        try {
            const template = fs.readFileSync(templateFile, 'utf8')
            tl.debug('Successfully loaded template file')

            return template
        } catch (err) {
            throw new Error(tl.loc('FailedToLoadTemplateFile', err))
        }
    }

    private async uploadTemplateFile(templateFile: string, s3BucketName: string): Promise<string> {
        const fileBuffer = fs.createReadStream(templateFile)
        const objectKey = path.basename(templateFile)

        console.log(tl.loc('UploadingTemplate', templateFile, objectKey, s3BucketName))
        try {
            await this.s3Client
                .upload({
                    Bucket: s3BucketName,
                    Key: objectKey,
                    Body: fileBuffer
                })
                .promise()

            const templateUrl = await SdkUtils.getPresignedUrl(this.s3Client, 'getObject', s3BucketName, objectKey)

            return templateUrl
        } catch (err) {
            throw new Error(tl.loc('TemplateUploadFailed', err))
        }
    }

    private loadTemplateParameters(): CloudFormation.Parameters | undefined {
        let parsedParameters: CloudFormation.Parameters | undefined

        switch (this.taskParameters.templateParametersSource) {
            case loadTemplateParametersFromFile:
                {
                    parsedParameters = this.loadParametersFromFile(this.taskParameters.templateParametersFile)
                }
                break

            case loadTemplateParametersInline:
                {
                    console.log(tl.loc('LoadingTemplateParameters'))
                    parsedParameters = this.parseParameters(this.taskParameters.templateParameters)
                }
                break
        }

        if (parsedParameters) {
            console.log(tl.loc('ParametersLoadSucceeded'))
        }

        return parsedParameters
    }

    private loadParametersFromFile(parametersFile: string): CloudFormation.Parameters | undefined {
        if (!parametersFile) {
            console.log(tl.loc('NoParametersFileSpecified'))

            return undefined
        }

        console.log(tl.loc('LoadingTemplateParametersFile', parametersFile))
        if (!tl.exist(parametersFile)) {
            throw new Error(tl.loc('ParametersFileDoesNotExist', parametersFile))
        }

        const parameterContent = fs.readFileSync(parametersFile, 'utf8')
        const templateParameters = this.parseParameters(parameterContent)

        return templateParameters
    }

    private parseParameters(parameters: string): CloudFormation.Parameters {
        let templateParameters: CloudFormation.Parameters
        try {
            tl.debug('Attempting parse as json content')
            templateParameters = JSON.parse(parameters) as CloudFormation.Parameters
        } catch (err) {
            try {
                tl.debug('Json parse failed, attempting yaml.')
                templateParameters = yaml.safeLoad(parameters) as CloudFormation.Parameters
            } catch (errorYamlLoad) {
                tl.debug('Yaml parse failed, cannot determine file content format.')
                throw new Error(tl.loc('ParametersLoadFailed'))
            }
        }

        tl.debug('Successfully parsed template parameters')

        return templateParameters
    }

    // If there were no changes, a validation error is thrown which we want to suppress
    // (issue #28) instead of erroring out and failing the build. The only way to determine
    // this is to inspect the message in conjunction with the status code, and over time
    // there has been some variance in service behavior based on how we attempted to make the
    // change. So now detect either of the errors, and for either if the message indicates
    // a no-op.
    private isNoWorkToDoValidationError(errCodeOrStatus: string, errMessage: string): boolean {
        let noWorkToDo = false
        const knownNoOpErrorMessages = [
            /^No updates are to be performed./,
            /^The submitted information didn't contain changes./
        ]

        try {
            if (errCodeOrStatus.search(/ValidationError/) !== -1 || errCodeOrStatus.search(/FAILED/) !== -1) {
                knownNoOpErrorMessages.forEach(element => {
                    if (errMessage.search(element) !== -1) {
                        noWorkToDo = true
                    }
                })
            }
            if (noWorkToDo) {
                if (this.taskParameters.warnWhenNoWorkNeeded) {
                    tl.warning(tl.loc('NoWorkToDo'))
                }

                return true
            }
            // tslint:disable-next-line:no-empty
        } catch (err) {}

        return false
    }

    private async waitForChangeSetCreation(changeSetName: string, stackName: string): Promise<boolean> {
        console.log(tl.loc('WaitingForChangeSetValidation', changeSetName, stackName))
        try {
            const parms: any = setWaiterParams(stackName, this.taskParameters.timeoutInMins, changeSetName)
            await this.cloudFormationClient.waitFor('changeSetCreateComplete', parms).promise()
            console.log(tl.loc('ChangeSetValidated'))
        } catch (err) {
            // Inspect to see if the error was down to the service reporting (as an exception trapped
            // by the waiter) that the set has no changes. If that is the case, return a signal to
            // the caller that no work is needed rather than fail the task. This allows CI pipelines
            // with multiple stacks to be updated when some stacks have no changes.
            // https://github.com/aws/aws-vsts-tools/issues/28
            const response = await this.cloudFormationClient
                .describeChangeSet({ ChangeSetName: changeSetName, StackName: stackName })
                .promise()
            if (
                response.Status &&
                response.StatusReason &&
                this.isNoWorkToDoValidationError(response.Status, response.StatusReason)
            ) {
                return false
            } else {
                throw new Error(tl.loc('ChangeSetValidationFailed', stackName, changeSetName, (err as Error).message))
            }
        }

        return true
    }
}
