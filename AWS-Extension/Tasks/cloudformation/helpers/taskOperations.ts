import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import Q = require('q');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import awsS3 = require('aws-sdk/clients/s3');

import TaskParameters = require('./taskParameters');
import { AWSError } from 'aws-sdk/lib/error';

export class TaskOperations {

    public static async deleteStack(taskParameters: TaskParameters.AwsCloudFormationTaskParameters): Promise<void> {

        const cfConfig = {
            apiVersion: '2010-05-15',
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            region: taskParameters.awsRegion
        };
        // create stack
        const cloudformation = new awsCloudFormation(cfConfig);

        const params: awsCloudFormation.DeleteStackInput = {
            StackName: taskParameters.stackName
        };

        cloudformation.deleteStack(params, function(err: AWSError, data: object) {
            if (err) {
                tl.setResult(tl.TaskResult.Failed, err.stack);
            } else {
                TaskOperations.waitForStackDeletion(cloudformation, taskParameters.stackName);
                return data;
            }
        });
    }

    public static async createNewStack(taskParameters: TaskParameters.AwsCloudFormationTaskParameters): Promise<void> {

        const params: awsCloudFormation.CreateStackInput = {
            OnFailure: taskParameters.onFailure,
            StackName: taskParameters.stackName
        };

        // cF configurations
        const cfConfig = {
            apiVersion: '2010-05-15',
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            },
            region: taskParameters.awsRegion
        };
        // read template details
        if (taskParameters.templateLocation === 'Linked artifact') {
            await this.createStackFromTemplateFile(taskParameters, cfConfig, params);
        } else {
            await this.createStackFromTemplateUrl(taskParameters, cfConfig, params);
        }
    }

    private static async createStackFromTemplateFile(taskParameters: TaskParameters.AwsCloudFormationTaskParameters,
                                                     cfConfig: awsCloudFormation.ClientConfiguration,
                                                     params: awsCloudFormation.CreateStackInput) {
        let template: string;
        try {
            tl.debug(`Loading Template File.. ${taskParameters.cfTemplateFile}`);
            template = fs.readFileSync(taskParameters.cfTemplateFile, 'utf8');
            params.TemplateBody = template;
            tl.debug('Loaded CF Template File');
            // load parameters file
            let templateParameters: awsCloudFormation.Parameters;
            templateParameters = JSON.parse(fs.readFileSync(taskParameters.cfParametersFile, 'utf8'));
            tl.debug('Loaded CF Template File Parameters');
            params.Parameters = templateParameters;
            const cloudformation = new awsCloudFormation(cfConfig);
            await cloudformation.createStack(params, function(err: AWSError, data: awsCloudFormation.CreateStackOutput) {
                if (err) {
                    tl.setResult(tl.TaskResult.Failed, err.stack);
                } else {
                    tl.debug(data.StackId);
                    TaskOperations.waitForStackCreation(cloudformation, taskParameters.stackName);
                    return data.StackId;
                }
            });
        } catch (error) {
            throw new Error('TemplateParsingFailed' + error.message);
        }
    }

    // wait for stack creation
    private static waitForStackCreation(cloudFormation: awsCloudFormation, stackName: string) {
        const paramsWaitFor = {
            StackName: stackName
        };

        cloudFormation.waitFor('stackCreateComplete',
                               paramsWaitFor,
                               function(waitForErr: AWSError, waitForData: awsCloudFormation.DescribeStacksOutput) {
            if (waitForErr) {
                console.log(waitForErr, waitForErr.stack);
            } else {
                console.log(`Stack ${stackName} created successfully`);
            }
        });
    }

    // wait for stack deletetion
    private static waitForStackDeletion(cloudFormation: awsCloudFormation, stackName: string) {
        const paramsWaitFor = {
            StackName: stackName
        };

        cloudFormation.waitFor('stackDeleteComplete',
                               paramsWaitFor,
                               function(waitForErr: AWSError, waitForData: awsCloudFormation.DescribeStacksOutput) {
            if (waitForErr) {
                console.log(waitForErr, waitForErr.stack);
            } else {
                console.log(`Stack ${stackName} deleted successfully`);
            }
        });
    }

    private static async createStackFromTemplateUrl(taskParameters: TaskParameters.AwsCloudFormationTaskParameters,
                                                    cfConfig: awsCloudFormation.ClientConfiguration,
                                                    params: awsCloudFormation.CreateStackInput) {
        const regExpression = new RegExp('(s3-|s3\.)?(.*)\.amazonaws\.com');
        const matches = taskParameters.cfParametersFileUrl.match(regExpression);
        if (matches != null) {
            const bucketUrlPos = taskParameters.cfParametersFileUrl.indexOf(matches[0]) + matches[0].length + 1;
            const bucketUrl = taskParameters.cfParametersFileUrl.slice(bucketUrlPos);
            tl.debug(`Bucket URl: ${bucketUrl}`);
            const bucketName = bucketUrl.split('/')[0];
            tl.debug(`Bucket name: ${bucketName}`);
            const fileKey = bucketUrl.slice(bucketUrl.indexOf(bucketName) + bucketName.length + 1);
            tl.debug(`Template File Key: ${fileKey}`);

            const s3Config = {
                apiVersion: '2006-03-01',
                credentials: {
                    accessKeyId: taskParameters.awsKeyId,
                    secretAccessKey: taskParameters.awsSecretKey
                },
                region: taskParameters.awsRegion
            };
            const s3 = new awsS3(s3Config);
            s3.getObject(
                { Bucket: bucketName, Key: fileKey },
                async function(error: AWSError, data: awsS3.GetObjectOutput) {
                    if (error != null) {
                        tl.setResult(tl.TaskResult.Failed,
                                     `Failed to retrieve template file from given URL ${error.stack}`);
                    } else {
                        tl.debug(`Template Parameter File Content: '${data.Body.toString()}'`);
                        // create stack
                        const cloudformation = new awsCloudFormation(cfConfig);
                        let templateParameters: awsCloudFormation.Parameters;
                        templateParameters = JSON.parse(data.Body.toString());
                        params.TemplateURL = taskParameters.cfTemplateUrl;
                        params.Parameters = templateParameters;
                        await cloudformation.createStack(params, function(err: AWSError, data: awsCloudFormation.CreateStackOutput) {
                            if (err) {
                                tl.setResult(tl.TaskResult.Failed, err.stack);
                            } else {
                                tl.debug(data.StackId);
                                TaskOperations.waitForStackCreation(cloudformation, taskParameters.stackName);
                                return data.StackId;
                            }
                        });
                    }
                }
            );
        }
    }
}
