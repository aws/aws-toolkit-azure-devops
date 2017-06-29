import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import awsS3 = require('aws-sdk/clients/s3');
import { AWSError } from 'aws-sdk/lib/error';

import TaskParameters = require('./taskParameters');

export class TaskOperations {

    public static async createStack(taskParameters: TaskParameters.CreateStackTaskParameters): Promise<void> {

        let stackId: string;
        if (taskParameters.templateLocation === 'Linked artifact') {
            stackId = await this.createStackFromTemplateFile(taskParameters);
        } else {
            stackId = await this.createStackFromTemplateUrl(taskParameters);
        }

        console.log(tl.loc('TaskCompleted', taskParameters.stackName, stackId));
    }

    private static cloudFormationClient: awsCloudFormation;

    private static s3Client: awsS3;

    private static createServiceClients(taskParameters: TaskParameters.CreateStackTaskParameters) {
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

    // creates and waits for completion, returning the stack id
    private static async createStackFromTemplateFile(taskParameters: TaskParameters.CreateStackTaskParameters) : Promise<string> {

        console.log(tl.loc('CreatingStackFromFiles', taskParameters.cfTemplateFile, taskParameters.cfParametersFile));

        let template: string;
        let templateParameters: awsCloudFormation.Parameters;

        try {
            console.log(tl.loc('LoadingTemplateFile', taskParameters.cfTemplateFile));
            template = fs.readFileSync(taskParameters.cfTemplateFile, 'utf8');
            tl.debug('Successfully loaded template file');

            if (taskParameters.cfParametersFile) {
                console.log(tl.loc('LoadingTemplateParameterFile', taskParameters.cfParametersFile));
                templateParameters = JSON.parse(fs.readFileSync(taskParameters.cfParametersFile, 'utf8'));
                tl.debug('Successfully loaded template file');
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
            return await this.waitForStackCreation(taskParameters.stackName);
        } catch (err) {
            console.error(tl.loc('StackCreateRequestFailed'), err);
            throw err;
        }
    }

    private static async createStackFromTemplateUrl(taskParameters: TaskParameters.CreateStackTaskParameters) : Promise<string> {

        console.log(tl.loc('CreatingStackFromUrls', taskParameters.cfTemplateUrl, taskParameters.cfParametersFileUrl));

        const regex: string = '(s3-|s3\.)?(.*)\.amazonaws\.com';
        const regExpression = new RegExp(regex);
        const matches = taskParameters.cfParametersFileUrl.match(regExpression);
        if (!matches) {
            throw new Error(tl.loc('UrlFormatError', regex));
        }

        const bucketUrlPos = taskParameters.cfParametersFileUrl.indexOf(matches[0]) + matches[0].length + 1;
        const bucketUrl = taskParameters.cfParametersFileUrl.slice(bucketUrlPos);
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
        } catch (err) {
            console.log(tl.loc('ParametersUrlLoadOrParseError', err.message));
            throw err;
        }

        try {
            const createStackResponse: awsCloudFormation.CreateStackOutput = this.cloudFormationClient.createStack({
                StackName: taskParameters.stackName,
                TemplateURL: taskParameters.cfTemplateUrl,
                Parameters: templateParameters
            }).promise();

            tl.debug(`Stack id ${createStackResponse.StackId}`);
            return await this.waitForStackCreation(taskParameters.stackName);
        } catch (err) {
            console.error(tl.loc('StackCreateRequestFailed'), err);
            throw err;
        }
    }

    private static async waitForStackCreation(stackName: string) : Promise<string> {

        return new Promise<string>((resolve, reject) => {
            console.log(tl.loc('WaitingForStack', stackName));

            this.cloudFormationClient.waitFor('stackCreateComplete',
                                              { StackName: stackName },
                                              function(err: AWSError, waitForData: awsCloudFormation.DescribeStacksOutput) {
                if (err) {
                    throw new Error(tl.loc('StackCreationFailed', stackName, err.message));
                } else {
                    console.log(tl.loc('StackCreated', stackName));
                    return waitForData.Stacks[0].StackId;
                }
            });
        });
    }

}
