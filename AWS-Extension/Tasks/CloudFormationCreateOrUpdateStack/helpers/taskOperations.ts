import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import awsS3 = require('aws-sdk/clients/s3');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async createStack(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters): Promise<void> {
        this.createServiceClients(taskParameters);

        let stackId: string;
        if (this.testStackExists(taskParameters.stackName)) {
            console.log(tl.loc('StackExists', taskParameters.stackName));

            if (taskParameters.templateLocation === 'LinkedArtifact') {
                stackId = await this.updateStackFromTemplateFile(taskParameters);
            } else {
                stackId = await this.updateStackFromTemplateUrl(taskParameters);
            }
        } else {
            console.log(tl.loc('StackNotExist', taskParameters.stackName));

            if (taskParameters.templateLocation === 'LinkedArtifact') {
                stackId = await this.createStackFromTemplateFile(taskParameters);
            } else {
                stackId = await this.createStackFromTemplateUrl(taskParameters);
            }
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

    private static async testStackExists(stackName: string) : Promise<boolean> {
        console.log(tl.loc('CheckingForStackExistence', stackName));

        try {
            await this.cloudFormationClient.describeStacks({ StackName: stackName }).promise();
            tl.debug(`describeStacks on stack ${stackName} succeeded, declaring stack exists`);
            return true;
        } catch (err) {
            tl.debug(`describeStacks on stack ${stackName} failed, declaring stack does not exist`);
            return false;
        }
    }

    private static async updateStackFromTemplateFile(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) : Promise<string> {
        console.log(tl.loc('UpdatingStackFromFiles', taskParameters.cfTemplateFile, taskParameters.cfParametersFile));

        let template: string;
        let templateParameters: awsCloudFormation.Parameters;

        try {
            template = await this.loadTemplateFile(taskParameters.cfTemplateFile);
            if (taskParameters.cfParametersFile) {
                templateParameters = await this.loadParametersFile(taskParameters.cfParametersFile);
            }
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        try {
            const request: awsCloudFormation.UpdateStackInput = {
                StackName: taskParameters.stackName,
                Parameters: templateParameters,
                TemplateBody: template
            };
            const response: awsCloudFormation.UpdateStackOutput = await this.cloudFormationClient.updateStack(request).promise();
            tl.debug(`Stack id ${response.StackId}`);
            await this.waitForStackUpdate(taskParameters.stackName);
            return response.StackId;
        } catch (err) {
            console.error(tl.loc('StackUpdateRequestFailed', err.message), err);
            throw err;
        }
    }

    private static async updateStackFromTemplateUrl(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) : Promise<string> {
        console.log(tl.loc('UpdateStackFromUrls', taskParameters.cfTemplateUrl, taskParameters.cfParametersFileUrl));

        const templateParameters = await this.loadParametersFromUrl(taskParameters.cfParametersFileUrl);

        try {
            const response: awsCloudFormation.UpdateStackOutput = await this.cloudFormationClient.updateStack({
                StackName: taskParameters.stackName,
                TemplateURL: taskParameters.cfTemplateUrl,
                Parameters: templateParameters
            }).promise();

            tl.debug(`Stack id ${response.StackId}`);
            await this.waitForStackUpdate(taskParameters.stackName);
            return response.StackId;
        } catch (err) {
            console.error(tl.loc('StackCreateRequestFailed', err.message), err);
            throw err;
        }
    }

    // creates and waits for completion, returning the stack id
    private static async createStackFromTemplateFile(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) : Promise<string> {

        console.log(tl.loc('CreatingStackFromFiles', taskParameters.cfTemplateFile, taskParameters.cfParametersFile));

        let template: string;
        let templateParameters: awsCloudFormation.Parameters;

        try {
            template = await this.loadTemplateFile(taskParameters.cfTemplateFile);
            if (taskParameters.cfParametersFile) {
                templateParameters = await this.loadParametersFile(taskParameters.cfParametersFile);
            }
        } catch (err) {
            console.error(tl.loc('TemplateFilesLoadFailure', err.message), err);
            throw err;
        }

        try {
            const request: awsCloudFormation.CreateStackInput = {
                StackName: taskParameters.stackName,
                OnFailure: taskParameters.onFailure,
                Parameters: templateParameters,
                TemplateBody: template
            };
            const response: awsCloudFormation.CreateStackOutput = await this.cloudFormationClient.createStack(request).promise();
            tl.debug(`Stack id ${response.StackId}`);
            await this.waitForStackCreation(taskParameters.stackName);
            return response.StackId;
        } catch (err) {
            console.error(tl.loc('StackCreateRequestFailed', err.message), err);
            throw err;
        }
    }

    private static async createStackFromTemplateUrl(taskParameters: TaskParameters.CreateOrUpdateStackTaskParameters) : Promise<string> {

        console.log(tl.loc('CreatingStackFromUrls', taskParameters.cfTemplateUrl, taskParameters.cfParametersFileUrl));

        const templateParameters = await this.loadParametersFromUrl(taskParameters.cfParametersFileUrl);

        try {
            const response: awsCloudFormation.CreateStackOutput = await this.cloudFormationClient.createStack({
                StackName: taskParameters.stackName,
                TemplateURL: taskParameters.cfTemplateUrl,
                Parameters: templateParameters
            }).promise();

            tl.debug(`Stack id ${response.StackId}`);
            await this.waitForStackCreation(taskParameters.stackName);
            return response.StackId;
        } catch (err) {
            console.error(tl.loc('StackCreateRequestFailed', err.message), err);
            throw err;
        }
    }

    private static async loadTemplateFile(templateFile: string): Promise<string> {
        console.log(tl.loc('LoadingTemplateFile', templateFile));
        const template = fs.readFileSync(templateFile, 'utf8');
        tl.debug('Successfully loaded template file');
        return template;
    }

    private static async loadParametersFile(parametersFile: string): Promise<awsCloudFormation.Parameters> {
        console.log(tl.loc('LoadingTemplateParameterFile', parametersFile));
        const templateParameters = JSON.parse(fs.readFileSync(parametersFile, 'utf8'));
        tl.debug('Successfully loaded template file');
        return templateParameters;
    }

    private static async loadParametersFromUrl(parametersFileUrl: string) : Promise<awsCloudFormation.Parameters> {
        const regex: string = '(s3-|s3\.)?(.*)\.amazonaws\.com';
        const regExpression = new RegExp(regex);
        const matches = parametersFileUrl.match(regExpression);
        if (!matches) {
            throw new Error(tl.loc('UrlFormatError', regex));
        }

        const bucketUrlPos = parametersFileUrl.indexOf(matches[0]) + matches[0].length + 1;
        const bucketUrl = parametersFileUrl.slice(bucketUrlPos);
        tl.debug(`Bucket URl: ${bucketUrl}`);
        const bucketName = bucketUrl.split('/')[0];
        tl.debug(`Bucket name: ${bucketName}`);
        const fileKey = bucketUrl.slice(bucketUrl.indexOf(bucketName) + bucketName.length + 1);
        tl.debug(`Template Parameters File Key: ${fileKey}`);

        let templateParameters: any;
        try {
            const downloadResponse: awsS3.GetObjectOutput = await this.s3Client.getObject({
                Bucket: bucketName,
                Key: fileKey
            }).promise();

            templateParameters = JSON.parse(downloadResponse.Body.toString());
            return templateParameters;
        } catch (err) {
            console.log(tl.loc('ParametersUrlLoadOrParseError', err.message));
            throw err;
        }
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
                    console.log(tl.loc('StackCreated'));
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
                    console.log(tl.loc('StackUpdated'));
                }
            });
        });
    }

}
