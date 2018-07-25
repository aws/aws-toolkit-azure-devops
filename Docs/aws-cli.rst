.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _aws-cli:

#####
|CLI|
#####

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Runs a command using the |CLI|. Note that you must have the |CLI| installed to use this task. See `Installing the AWS Command Line Interface
<https://docs.aws.amazon.com/cli/latest/userguide/installing.html>`_ for more details.

Description
===========

The |CLI| uses a multipart structure on the command line. It starts with the base call to AWS.
The next part specifies a top-level command, which often represents an AWS service that the |CLI| supports. Each AWS service has
additional subcommands that specify the operation to perform. You can specify the general |CLI| options, or the specific parameters
for an operation, in any order on the command line. If you specify an exclusive parameter multiple times, only the last value
applies.

.. code-block:: sh

        <command> <subcommand> [options and parameters]

Parameters can take various types of input values such as numbers, strings, lists, maps, and JSON
structures.

Parameters
==========

You can set the following parameters for the task. Required parameters are noted by an asterisk (*). Other parameters are optional.


Display name*
-------------

    The default name of the task instance, which can be modified: |CLI|

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

Command*
--------

    The |CLI| command to run. Run :code:`aws help` in the |CLIlong| to get a complete list of commands,
    or see
    :cli-ug:`CommandStructure <command-structure>` in the |CLIlong|.

Subcommand
----------

    The |CLI| subcommand to run. Run :code:`aws help` in the |CLIlong| to get a complete list of commands,
    or see
    :cli-ug:`CommandStructure <command-structure>` in the |CLIlong|.


Options and Parameters
----------------------

    The arguments to pass to the |CLI| command. Run :code:`aws <command> --help` in the |CLIlong| to
    get the complete list of arguments supported by the command.

Advanced
--------

Fail on Standard Error
~~~~~~~~~~~~~~~~~~~~~~

    If true, this task fails if any errors are written to the StandardError stream.

Task Permissions
================

Permissions for this task to call AWS service APIs depend on the configured command.
