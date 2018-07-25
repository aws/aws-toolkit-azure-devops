.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _lambda-deploy:

###################################
|LAMlong| Deployment Task
###################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Supports deployment of |LAMlong| functions for all supported |LAM| language runtimes. Note that
this task can be used to deploy .NET Core-based functions but it does not build the deployment
package first. To perform a build and deployment for .NET Core-based functions, or to deploy
.NET Core-based serverless applications, please refer to the |LAMlong| .NET Core Deployment task.

Description
===========

Applications that are based on |LAM| (also referred to as serverless applications) are composed of functions
triggered by events. A typical serverless application consists of one or more functions triggered
by events such as object uploads to |S3|, |SNS| notifications, and API actions. Those
functions can stand alone or use other resources such as |DDBlong| tables or |S3| buckets.
The most basic serverless application is simply a function.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.

Display name*
-------------

    The default name of the task instance, which can be modified: Deploy Lambda Function

AWS Credentials
---------------

    Specifies the AWS credentials to be used by the task in the build agent environment.

    You can specify credentials using a service endpoint (of type AWS) in the task configuration or you can leave unspecified. If
    unspecified the task will attempt to obtain credentials from the following sources in order:

    * From task variables named *AWS.AccessKeyID*, *AWS.SecretAccessKey* and optionally *AWS.SessionToken*.
    * From credentials set in environment variables in the build agent process. When using environment variables in the
      build agent process you may use the standard AWS environment variables: *AWS_ACCESS_KEY_ID*, *AWS_SECRET_ACCESS_KEY* and
      optionally *AWS_SESSION_TOKEN*.
    * If the build agent is running on an Amazon EC2 instance, from the instance metadata associated with the EC2 instance. For
      credentials to be available from EC2 instance metadata the instance must have been started with an instance profile referencing
      a role granting permissions to the task to make calls to AWS on your behalf. See IAMRolesForEC2_ for more information.

AWS Region
----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

    If a region is not specified in the task configuration the task will attempt to obtain the region to be used using the standard
    AWS environment variable *AWS_REGION* in the build agent process's environment. Tasks running in build agents hosted on Amazon EC2
    instances (Windows or Linux) will also attempt to obtain the region using the instance metadata associated with the EC2 instance
    if no region is configured on the task or set in the environment variable.

    **Note:** The regions listed in the picker are those known at the time this software was released. New regions that are not listed
    may still be used by entering the *region code* of the region (for example *us_west_2*).

Deployment Mode*
----------------

    Selects the type of deployment. You can deploy new function code to an existing function or you can specify settings for both code and configuration. For the 'code and configuration' mode if the function does not exist it will be created.

Function Name*
--------------

    The name of the Lambda function to create or update. You can also specify the Amazon Resource Name (ARN) for an existing function.

Description
-----------

    A short, user-defined function description. Lambda does not use this value.

Function Handler*
-----------------

    "The function within your code that Lambda calls to begin execution. For Node.js, it is the module-name.export value in your function. For Java, it can be package.class-name::handler or package.class-name. For more information and other examples see `Programming Model<https://docs.aws.amazon.com/lambda/latest/dg/programming-model-v2.html>`_.

Runtime*
--------

    The runtime environment for the Lambda function you are uploading. The list of runtimes available in the pick list are those known at the time this version of the tools was released. To use a runtime not shown in the list simply enter the runtime identifier in the field.

Code Location*
--------------

    Specifies the source location of the deployment package to be uploaded. You can choose from a file in the local file
    system or a file previously uploaded to Amazon S3. If the source location is Amazon S3 you can also optionally supply
    a specific version of the file.

Zip File Path
-------------

    Path to the zip file containing the function code to deploy. Required if *Code Location* is set to *Zip file in the work area*.

S3 Bucket
---------

    The name of the Amazon S3 bucket containing the previously uploaded zip file of the function's code. Required if *Code Location* is set to *Zip file in Amazon S3*.

S3 Object Key
-------------

    The key (name) of the object in the bucket containing the function's code.  Required if *Code Location* is set to *Zip file in Amazon S3*.

S3 Object Version
-----------------

    Version of the S3 object containing the function code. If not specified the latest version of the object is used.

Role ARN or Name*
-----------------

    The Amazon Resource Name (ARN), or name, of the IAM role that Lambda assumes when it executes your function to access any other Amazon Web Services (AWS) resources. If a role name is supplied the task will attempt to retrieve the ARN automatically.

Memory Size
-----------

    The amount of memory, in MB, your Lambda function is given. Lambda uses this memory size to infer the amount of CPU and memory allocated to your function. Your function use-case determines your CPU and memory requirements. For example, a database operation might need less memory compared to an image processing function. The default value is 128 MB. The value must be a multiple of 64 MB.

Timeout
-------

    The function execution time at which Lambda should terminate the function. Because the execution time has cost implications, we recommend you set this value based on your expected execution time. The default is 3 seconds.

Publish
-------

    If set requests AWS Lambda to create or update the Lambda function and publish a version as an atomic operation.

Advanced
--------

    Advanced settings are only displayed when creating a new function, or updating code and configuration for an existing function.

Dead Letter ARN
~~~~~~~~~~~~~~~

    The Amazon Resource Name (ARN) of an Amazon SQS queue or Amazon SNS topic to be used as your Dead Letter Queue (DLQ).

KMS Key ARN
~~~~~~~~~~~

    The Amazon Resource Name (ARN) of the KMS key used to encrypt your function's environment variables. If not provided,
    |LAMlong| will use a default service key.

Environment Variables
~~~~~~~~~~~~~~~~~~~~~

    Key-value pairs that represent your environment's configuration settings. Enter as Name=Value, one per line.

Tags
~~~~

    List of tags (key-value pairs) assigned to the new function. Enter as *key*=*value*, one per line. Tags can only be specified
    when creating a new function and are ignored when updating functions.

Security Group IDs
~~~~~~~~~~~~~~~~~~

    List of security group IDs, one per line. If your Lambda function accesses resources in a VPC at least one security group and one
    subnet ID belonging to the same VPC must be specified.

Subnet IDs
~~~~~~~~~~

    List of subnet IDs, one per line. If your Lambda function accesses resources in a VPC at least one security group and one subnet
    ID belonging to the same VPC must be specified.

Tracing configuration
~~~~~~~~~~~~~~~~~~~~~

    Your function's trace settings. Can be either X-Ray, PassThrough or Active. If PassThrough, Lambda will only trace the request from
    an upstream service if it contains a tracing header with "sampled=1". If Active, Lambda will respect any tracing header it receives
    from an upstream service. The default setting of X-Ray means that if no tracing header is received, Lambda will call X-Ray for a
    tracing decision.

Output Variable
~~~~~~~~~~~~~~~

    The name of the variable that will contain the Amazon Resource Name (ARN) of the created or updated function on task completion. The variable can be used as $(variableName) to refer to the function result in subsequent tasks.

Task Permissions
================

This task requires permissions to call the following AWS service APIs (depending on selected task options, not all APIs may be used):

  * lambda:CreateFunction
  * lambda:GetFunction
  * lambda:UpdateFunctionCode
  * lambda:UpdateFunctionConfiguration
