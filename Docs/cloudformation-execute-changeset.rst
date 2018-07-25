.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _cloudformation-execute-changeset:

#################################
|CFNlong| Execute Change Set Task
#################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks


Synopsis
========

Executes an |CFNlong| change set to create or update a stack.

Description
===========

When you execute a change set, |CFNlong| deletes all other change sets associated with the
stack because they aren't valid for the updated stack.

|CFNlong| updates a stack using the input information that was provided when the specified change set
was created.

If a stack policy is associated with the stack, |CFNlong| enforces the policy during the update.
You can't specify a temporary stack policy that overrides the current policy.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.


Display name*
-------------

    The default name of the task instance, which can be modified: Execute Change Set

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

Change Set Name*
----------------

    The name or |arnlong| (ARN) of the change set that you want to execute.

Stack Name
----------

    The stack name or ARN of the stack associated with the change set. This value is required if you specify the name of a change set to execute. If the ARN of the change set ARN is specified this field is optional.

    The name must be unique in the region in which you are creating the stack. A stack name can contain only alphanumeric characters (case-sensitive) and hyphens. It must start with an alphabetic character and cannot be longer than 128 characters.

Output Variable
---------------

    The name of the variable that will contain the ID of the stack on task completion. The variable can be used as $(variableName) to refer to the stack ID in subsequent tasks.

Task Permissions
================

This task requires permissions to call the following AWS service APIs (depending on selected task options, not all APIs may be used):

  * cloudformation:DescribeStacks
  * cloudformation:DescribeChangeSet
  * cloudformation:DescribeStackResources
  * cloudformation:ExecuteChangeSet
