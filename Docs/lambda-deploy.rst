.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

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

Displayname*
------------

    The default name of the task, |LAMlong| Deploy Function. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to be used by the task when it executes on a build host. If needed, choose :guilabel:`+`, and then add a new
    AWS service endpoint connection.

AWS Region*
-----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

Deployment Mode*
----------------

    The operating mode for the task. The default setting, *Update code only*, exclusively uploads new code for an already
    published function. The alternative setting, *Update code and configuration (or create a new function)* can be
    used to publish new functions or to deploy new code, and other configuration settings, to a pre-existing function.
    When updating code and configuration the task performs the configuration changes first, then uploads and optionally
    publishes the new code.

Function Name*
--------------

    The name of the function to update or create.

Description
-----------

    A short, user-defined function description. Lambda does not use this value. 

Function Handler*
-----------------

    Displayed when creating a new function, or updating code and configuration for an existing function. Specifies the
    name of the handler that will be called when your function is invoked. Different languages have different rules
    for the formatting of this field. For more information, see https://docs.aws.amazon.com/lambda/latest/dg/programming-model-v2.html.

Runtime*
--------

    Displayed when creating a new function, or updating code and configuration for an existing function. Specifies the language
    runtime appropriate to the code you are deploying.

Code Location*
--------------

    Specifies the source location of the deployment package to be uploaded. You can choose from a file in the local file
    system or a file previously uploaded to Amazon S3. If the source location is Amazon S3 you can also optionally specify
    a specific version of the file.

Role ARN or Name*
-----------------

    Displayed when creating a new function, or updating code and configuration for an existing function. Specifies the role
    to be assumed when your function is invoked. The role supplies credentials (if needed) to your function as well as
    controlling AWS resource access. You can specify either the name of the role or the role's Amazon Resource Name (ARN).
    If the role name is specified the task will retrieve and use the role ARN for you.

Memory Size
-----------

    Displayed when creating a new function, or updating code and configuration for an existing function. The amount of memory, in MB,
    your Lambda function is given. Lambda uses this memory size to infer the amount of CPU and memory allocated to your function. Your
    function use-case determines your CPU and memory requirements. For example, a database operation might need less memory compared
    to an image processing function. The default value is 128 MB. The value must be a multiple of 64 MB.

Timeout
-------

    Displayed when creating a new function, or updating code and configuration for an existing function. Specifies the execution time
    at which Lambda should terminate the function. Because the execution time has cost implications, we recommend you set this value
    based on your expected execution time. The default is 3 seconds.

Publish
-------

    This parameter can be used to request AWS Lambda to create or update the Lambda function and publish a version as an atomic operation.

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

    Your function's environment configuration settings. Specify one pair per line, in *key*=*value* format.

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

