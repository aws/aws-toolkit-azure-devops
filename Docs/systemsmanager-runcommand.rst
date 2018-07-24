.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _systemsmanager-runcommand:

###############################
AWS Systems Manager Run Command
###############################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Runs a Systems Manager or user-provided Command on a fleet of EC2 instances. Commands
can also target on-premise machines if the required Systems Manager agent is installed.

Description
===========

This task runs a Systems Manager Command, or a user-provided Command, on a fleet of EC2
instances. On-premise machines can also be targets if the required Systems Manager agent is
installed. The command to run is identified by name. The targets on which the command
will be run are identified using either instance IDs or tags. Parameters specific to the selected
Command can also be specified.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.

Display name*
-------------

    The default name of the task instance, which can be modified: Systems Manager Get Parameter

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

Document Name*
--------------

    The name of the Systems Manager document to execute. This can be a public document or a custom document private to your account and to which the credentials supplied to the task have access.

Parameters
----------

    The required and optional parameters for the document to be executed, specified as JSON.
    Refer to the specific command to be run for details.

    Example format: :code:`{ "parameter1" : [ "value" ], "parameter2" : [ "value","value2" ] }`

Comment
-------

    User-specified information about the command, such as a brief description of what the command should do. Maximum length 100 characters.

Service Role ARN
----------------

    The |ARNlong| (ARN) or name of the IAM role Systems Manager uses to send notifications. If the name of a role is supplied the task will automatically determine the ARN.

Select Targets by*
------------------

    Sets how the list of instances to be targeted are specified. You can supply a list of instance IDs, or tags (as key=value pairs) for search criteria or you can supply the instance IDs using the name of a build variable. The value of the build variable should be a comma delimited list of IDs.

Instance IDs
------------

    The instance IDs where the command should execute.

    You can specify a maximum of 50 IDs, one per line. For more information about how to use Targets, see `Sending Commands to a Fleet<https://docs.aws.amazon.com/systems-manager/latest/userguide/send-commands-multiple.html>`_.

    This parameter is required if *Select Targets by* is set to *Manually select instances*.

Tags
----

    A list of tags that targets instances using a Key=Value combination that you specify, one per line. For more information about how to use Targets, see `Sending Commands to a Fleet<https://docs.aws.amazon.com/systems-manager/latest/userguide/send-commands-multiple.html>`_.

    This parameter is required if *Select Targets by* is set to *From tags*.

Variable Name
-------------

    The name of the build variable containing the list of instance IDs to target, as a comma delimited list.

    **Note:** you should specify just the variable name, do not enclose it in $() syntax.

    This parameter is required if *Select Targets by* is set to *Build variable name*.

Execution Concurrency
---------------------

    The maximum number of instances that are allowed to execute the command at the same time. You can specify a number such as 10 or a percentage such as 10%. The default value is 50.

    For more information about how to use MaxConcurrency, see `Using Concurrency Controls<https://docs.aws.amazon.com/systems-manager/latest/userguide/send-commands-velocity.html>`_.

Max Errors Before Stop
----------------------

    The maximum number of errors allowed without the command failing. When the command fails one more time beyond the value of MaxErrors, the systems stops sending the command to additional targets. You can specify a number like 10 or a percentage like 10%. The default value is 50.

    For more information about how to use MaxErrors, see `Using Error Controls<https://docs.aws.amazon.com/systems-manager/latest/userguide/send-commands-maxerrors.html>`_.

Timeout (seconds)
-----------------

    If this time is reached and the command has not already started executing, it will not execute.

    Minimum value of 30, maximum value of 2592000. Default value: 600.

Notification ARN
----------------

    An |ARNLong| (ARN) for a |SNS| (SNS) topic. Run Command pushes notifications about command status changes to this topic.

Notification Events
-------------------

    The different events for which you can receive notifications. For more information see `Setting Up Events and Notifications<https://docs.aws.amazon.com/systems-manager/latest/userguide/monitor-commands.html>`_.

Notification Type
-----------------

    * *Command*: Receive notification when the status of a command changes.
    * *Invocation*: For commands sent to multiple instances, receive notification on a per-instance basis when the status of a command changes.

S3 Bucket Name
--------------

    The name of the |S3 bucket where command execution responses should be stored.

S3 Key Prefix
-------------

    The key prefix (folder structure) within the S3 bucket where the S3 objects containing the responses should be stored.

Command ID Output Variable
--------------------------

    The name of a variable that will contain the unique ID assigned to the command.
    The command ID can be used future references to the request.
