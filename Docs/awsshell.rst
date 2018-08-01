.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _awsshell:

#################################
AWS Shell
#################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Run a shell script using Bash with AWS credentials.

Description
===========

Runs a shell script in Bash, setting AWS credentials and region information into the shell environment using the standard environment keys *AWS_ACCESS_KEY_ID*, *AWS_SECRET_ACCESS_KEY*, *AWS_SESSION_TOKEN* and *AWS_REGION*.

Parameters
==========

You can set the following parameters for the task. Required parameters are noted by an asterisk (*). Other parameters are optional.


Display name*
-------------

The default name of the task instance, which can be modified: AWS Shell Script

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

Arguments
---------

    The arguments to be passed to the shell script.

Script Source
-------------

    The source of the script to run in the shell. Choose *Script file* to enter the file path to the script to be run or *Inline script*
    to specify the source code for the script in the task configuration.

Script Path
-----------

    When *Script Source* is set to *Script file*, specifies the file path to the script to execute. This must be a fully qualified path
    or a path relative to the $(System.DefaultWorkingDirectory) location. The script file must exist.

Inline Script
-------------

    The source code of the script to run when *Script Source* is set to *Inline script*. A maximum of 5000 characters is allowed.

Specify Working Directory
-------------------------

    If selected a custom working directory, which must exist, can be specified for the script. The default behavior when unchecked is
    to set the working directory for the shell to be the script file location.

Working Directory
-----------------

    If *Specify Working Directory* is checked, contains the custom working directory for the script.

Fail on Standard Error
~~~~~~~~~~~~~~~~~~~~~~

    If this option is selected, the task will fail if any errors are written to the standard error stream.

Task Permissions
================

Permissions for this task to call AWS service APIs depend on the activities in the supplied script.
