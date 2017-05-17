import tl = require("vsts-task-lib/task");
import path = require("path");
import fs = require("fs");
import Q = require('q');
import awsCloudFormation = require('aws-sdk/clients/cloudformation');
import awsS3 = require('aws-sdk/clients/s3');

import awsCFDeploymentParameters = require("./deploymentParameters");

export class CFStackOperations {
    //wait for stack creation
    private static waitForStackCreation(cloudFormation: awsCloudFormation, stackName) {
        var paramsWaitFor = {
            StackName: stackName
        }

        cloudFormation.waitFor('stackCreateComplete', paramsWaitFor, function (waitForErr,
            waitForData) {
            if (waitForErr) {
                console.log(waitForErr, waitForErr.stack); // an error occurred
            } else {
                console.log('Stack' + stackName + 'created successfully');
            }

        });
    }
    //wait for stack deletetion 
    private static waitForStackDeletion(cloudFormation: awsCloudFormation, stackName) {
        var paramsWaitFor = {
            StackName: stackName
        }

        cloudFormation.waitFor('stackDeleteComplete', paramsWaitFor, function (waitForErr,
            waitForData) {
            if (waitForErr) {
                console.log(waitForErr, waitForErr.stack); // an error occurred
            } else {
                console.log('Stack' + stackName + 'deleted successfully');
            }

        });
    }

    private static async createStackFromTemplateUrl(taskParameters: awsCFDeploymentParameters.CFDeploymentParameters, cfConfig: awsCloudFormation.ClientConfiguration, params: awsCloudFormation.CreateStackInput) {
        var regExpression = new RegExp('(s3-|s3\.)?(.*)\.amazonaws\.com');
        var matches = taskParameters.cfParametersFileUrl.match(regExpression);
        if (matches != null) {
            var bucketUrl = taskParameters.cfParametersFileUrl.slice(taskParameters.cfParametersFileUrl.indexOf(matches[0]) + matches[0].length + 1);
            tl.debug("Bucket URl: " + bucketUrl);
            var bucketName = bucketUrl.split("/")[0];
            tl.debug("Bucket name: " + bucketName);
            var fileKey = bucketUrl.slice(bucketUrl.indexOf(bucketName) + bucketName.length + 1);
            tl.debug("Template File Key: " + fileKey);

            var s3Config = {
                apiVersion: '2006-03-01',
                region: taskParameters.awsRegion,
                credentials: {
                    accessKeyId: taskParameters.awsKeyId,
                    secretAccessKey: taskParameters.awsSecretKey
                }
            };
            var s3 = new awsS3(s3Config);
            s3.getObject(
                { Bucket: bucketName, Key: fileKey },
                async function (error, data) {
                    if (error != null) {
                        tl.setResult(tl.TaskResult.Failed, "Failed to retereive template file from given URL " + error.stack);
                    } else {
                        tl.debug("Template Parameter File Content" + data.Body.toString());
                        //create stack
                        var cloudformation = new awsCloudFormation(cfConfig);
                        var templateParameters: awsCloudFormation.Parameters;
                        templateParameters = JSON.parse(data.Body.toString());
                        params.TemplateURL = taskParameters.cfTemplateUrl;
                        params.Parameters = templateParameters;
                        await cloudformation.createStack(params, function (err, data) {
                            if (err) {
                                //tl.error(err, err.stack); // an error occurred
                                tl.setResult(tl.TaskResult.Failed, err.stack);
                            }
                            else {
                                tl.debug(data.StackId);           // successful response
                                CFStackOperations.waitForStackCreation(cloudformation, taskParameters.stackName);
                                return data.StackId;

                            }
                        });
                    }
                }
            );
        }
    }

    private static async createStackFromTemplateFile(taskParameters: awsCFDeploymentParameters.CFDeploymentParameters, cfConfig: awsCloudFormation.ClientConfiguration, params: awsCloudFormation.CreateStackInput) {
        var template: string;
        try {
            tl.debug("Loading Template File.. " + taskParameters.cfTemplateFile);
            template = fs.readFileSync(taskParameters.cfTemplateFile, 'utf8');
            params.TemplateBody = template;
            tl.debug("Loaded CF Template File");
            //load parameters file
            var templateParameters: awsCloudFormation.Parameters;
            templateParameters = JSON.parse(fs.readFileSync(taskParameters.cfParametersFile, 'utf8'));
            tl.debug("Loaded CF Template File Parameters");
            params.Parameters = templateParameters;
            var cloudformation = new awsCloudFormation(cfConfig);
            await cloudformation.createStack(params, function (err, data) {
                if (err) {
                    tl.setResult(tl.TaskResult.Failed, err.stack);
                }
                else {
                    tl.debug(data.StackId);
                    CFStackOperations.waitForStackCreation(cloudformation, taskParameters.stackName);
                    return data.StackId;

                }
            });
        }
        catch (error) {
            throw new Error("TemplateParsingFailed" + error.message);
        }
    }

    public static async deteleStack(taskParameters: awsCFDeploymentParameters.CFDeploymentParameters): Promise<void> {
        //define params
        var params = {
            StackName: taskParameters.stackName
        }
        var cfConfig = {
            apiVersion: '2010-05-15',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };
        //create stack
        var cloudformation = new awsCloudFormation(cfConfig);
        await cloudformation.deleteStack(params, function (err, data) {
            if (err) {
                //tl.error(err, err.stack); // an error occurred
                tl.setResult(tl.TaskResult.Failed, err.stack);
            }
            else {
                CFStackOperations.waitForStackDeletion(cloudformation, taskParameters.stackName);
                return data;
            }
        });
    }
    
    public static async createNewStack(taskParameters: awsCFDeploymentParameters.CFDeploymentParameters): Promise<void> {
        //define params
        var params: awsCloudFormation.CreateStackInput;
        params = {
            StackName: taskParameters.stackName,
            OnFailure: taskParameters.onFailure
        };
        //CF configurations
        var cfConfig = {
            apiVersion: '2010-05-15',
            region: taskParameters.awsRegion,
            credentials: {
                accessKeyId: taskParameters.awsKeyId,
                secretAccessKey: taskParameters.awsSecretKey
            }
        };
        //Read template details
        if (taskParameters.templateLocation === "Linked artifact") {
            await this.createStackFromTemplateFile(taskParameters, cfConfig, params);
        } else {
            await this.createStackFromTemplateUrl(taskParameters, cfConfig, params);
        }
    }
}
