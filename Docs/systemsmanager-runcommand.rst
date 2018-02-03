.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

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

Displayname*
------------

    The default name of the task, AWS Systems Manager Get Parameter. You can rename it or append the name of the
    associated Parameter Store parameter or parameter path to it.

AWS Credentials*
----------------

    The AWS credentials to be used by the task when it executes on a build host. If needed, choose :guilabel:`+`, and then add a new
    AWS service endpoint connection.

AWS Region*
-----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

Document Name*
--------------

    The name of the Command document to run. This can be a Systems Manager-provided document or a custom
    document private to your account and to which you have access.

Parameters
----------

    The required and optional parameters for the document to be executed, specified as JSON. 
    Refer to the specific command to be run for details.

    Example format: :code:`{ "param1" : [ "value" ], "param2" : [ "value","value2" ] }`

Comment
-------

    User-specified information about the command, such as a brief description of what the 
    command should do. Maximum length 100 characters.

Service Role ARN
----------------

    The Amazon Resource Name (ARN) or name of the IAM role Systems Manager uses to send notifications. 
    If the name of a role is supplied the task will automatically determine the ARN.

Select Targets by*
------------------

    How the instances to be targetted by the command are selected. You can choose from Instance IDs, 
    Tags or the name of a build variable containing a list of instance IDs.

Instance IDs
------------

    Required if target selection is set to Instance IDs. You can specify up to 50 instance IDs, one per line.

Tags
----

    Required if target selection is set to Tags. Specify tags one per line, in the format 'Key=Value'.

Variable Name
-------------

    Required if target selection is set to Build Variable Name. Specify the name of the variable. 
    Do not enclose the variable name in $() syntax. The variable should contain a comma-delimited 
    list of instance IDs.

Execution Concurrency
---------------------

    The maximum number of instances that are allowed to execute the command at the same time. 
    You can specify a number such as 10 or a percentage such as 10%. The default value is 50.

Max Errors Before Stop
----------------------

    The maximum number of errors allowed without the command failing. When the command fails one 
    more time beyond the value specified, the systems stops sending the command to additional targets. 
    You can specify a number like 10 or a percentage like 10%. The default value is 50.

Timeout (seconds)
-----------------

    If this time is reached and the command has not already started executing, it will not execute. 
    Minimum value of 30, maximum value of 2592000. Default value: 600.

Notification ARN
----------------

    An Amazon Resource Name (ARN) for a Simple Notification Service (SNS) topic. 
    Run Command pushes notifications about command status changes to this topic.

Notification Events
-------------------

    The different events for which you can receive notifications.

Notification Type
-----------------

    Select :guilabel:`Command` to receive notification when the status of a command changes. 
    For commands sent to multiple instances, select :guilabel:`Invocation`, to receive
    notification on a per-instance basis when the status of a command changes.

S3 Bucket Name
--------------

    The name of the S3 bucket where command execution responses should be stored.

S3 Key Prefix
-------------

    The directory structure within the S3 bucket where the responses should be stored.

Command ID Output Variable
--------------------------

    The name of a variable that will contain the unique ID assigned to the command. 
    The command ID can be used future references to the request.
