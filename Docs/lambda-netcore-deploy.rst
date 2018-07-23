.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _lambda-netcore-deploy:
.. _IAMRolesForEC2: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html

###################################
|LAMlong| .NET Core Deployment Task
###################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Builds, packages and deploys a .NET Core |LAMlong| function or serverless application.  Optionally the task can create the
deployment package for subsequent deployment in another build or release pipeline.

**Note:** this task is specific to Lambda functions written in C# or F#. For other languages supportedby |LAM| please
refer to the |LAMlong| Deploy Function task.

Description
===========

Applications based on |LAM| (also referred to as serverless applications) are composed of functions
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

    The default name of the task instance, which can be modified: Deploy .NET Core to Lambda

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

Deployment Type*
----------------

    The type of deployment to perform, or package to build or deploy.

    * *Function* deploys a single function to |LAM|, or creates a package zip file for subsequent deployment.
    * *Serverless Application* performs a deployment using |CFNLong| (allowing multiple functions to be deployed at the same time) or builds the application and uploads it to Amazon S3, outputting the serverless template file for subsequent deployment of the updated code using |CFNLong||.

    **Note:** both options will perform the relevant NuGet package restore and build operations to create the resulting deployment package.


Create deployment package only
------------------------------

    If selected the task creates the outputs for the selected deployment type but does not perform the deployment to AWS lambda or AWS CloudFormation.

Package-only output file
------------------------

    Available when *Create deployment package only* is selected.

    When *Deployment Type* is set to *Function* specifies the output folder and filename of the packaged zip file. This zip file can then be used with the *AWS Lambda Deploy Function* task to perform the deployment at a later stage.

    When *Deployment Type* is set to *Serverless Application* specifies the output folder and filename where the serverless template file, updated to contain the Amazon S3 location of the built project code and artifacts, will be placed. This updated template can then be used with the *AWS CloudFormation Create/Update Stack* task, or |CFNLong| change set tasks, to perform the deployment at a later stage.

Path to |LAM| Project*
----------------------

    The relative path to the location of the |LAM|| function or serverless application project to package and/or deploy.

Function Deployment: |LAM| Function Properties
----------------------------------------------

Function Name
~~~~~~~~~~~~~

    The name of the |LAM| function to invoke. You can also specify the |arnlong| (ARN)
    of the function when deploying to an existing function.

Function Role
~~~~~~~~~~~~~

    The name of the |IAM| role providing access to AWS services for the deployed |LAM| function.

Function Handler
~~~~~~~~~~~~~~~~

    The function within your code that |LAM| calls to begin execution. The format is
    :code:`<assembly-name>::<namespace.type-name>::<function-name>`.

Function Memory (MB)
~~~~~~~~~~~~~~~~~~~~

    The memory allocated to the |LAM| function. The value must be in multiples of 64.

Function Timout (Seconds)
~~~~~~~~~~~~~~~~~~~~~~~~~

    The function execution time at which |LAM| should terminate the function.

Serverless Application Deployment: Serverless Application Properties
--------------------------------------------------------------------

Stack Name
~~~~~~~~~~

    The name of the |CFNLong| stack to deploy to.

    **Note:** This field is required when performing a deployment of a serverless application using this task. When performing a package-only build this field is ignored as the stack name is only relevant during deployment.

S3 Bucket
~~~~~~~~~

    The name of the |S3| bucket used to store the built project code. This field is required when performing a either a deployment or package-only build of a serverless application.

S3 Prefix
~~~~~~~~~

    The object key prefix to be used for the packaged objects that will be uploaded to |S3| for subsequent deployment.


Advanced
--------

Additional Command Line Arguments for |LAM| Tools
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Additional arguments that can be passed to the :code:`dotnet lambda` CLI extension command that is used to build, package and deploy your function or serverless application using this task.


