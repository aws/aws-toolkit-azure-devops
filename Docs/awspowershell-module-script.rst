.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _awspowershell-module-script:
.. _IAMRolesForEC2: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html

#####################
|TWPlong| Script Task
#####################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks, VSTS

Synopsis
========

Runs a PowerShell script that uses cmdlets from the |TWPlong| module. The module is automatically installed
if it isn't already available in the environment.

Description
===========

This task accepts a PowerShell command or script that uses cmdlets from the |TWP| module to interact with AWS services.
You can specify the script to run via its file name, or you can enter it into the task
configuration. Before running the supplied script, the task tests to see if the required |TWP| module
is already installed. If it isn't installed, the latest available version from the `PowerShell Gallery
<https://www.powershellgallery.com/packages/AWSPowerShell>`_ is downloaded and installed.

.. note:: If an installation is performed, the module is installed in the :code:`current user`
         scope. The location is compatible with automatic module load. As a result, you don't
         need to import the module in your script.

Parameters
==========

You can set the following parameters for the task. Required parameters
are noted by an asterisk (*). Other parameters are optional.

Display name*
-------------

    The default name of the task instance, which can be modified: AWS Tools for Windows PowerShell Script

AWS Credentials
---------------

    Specifies the AWS credentials to be used by the task in the build agent environment.

    You can specify credentials using a service endpoint (of type AWS) in the task configuration or you can leave unspecified. If
    unspecified the task will attempt to use credentials set in environment variables in the build agent process or, if the build agent
    is running on an Amazon EC2 instance, the task can obtain and use credentials from the instance metadata associated with the EC2
    instance. For credentials to be available from EC2 instance metadata the instance must have been started with an instance profile
    referencing a role granting permissions to the task to make calls to AWS on your behalf. See
    IAMRolesForEC2_ for more information.

    When using environment variables in the build agent process you may use the standard AWS environment variables - *AWS_ACCESS_KEY_ID*,
    *AWS_SECRET_ACCESS_KEY* and optionally *AWS_SESSION_TOKEN*.

AWS Region
----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

    If a region is not specified in the task configuration the task will attempt to obtain the region to be used using the standard
    AWS environment variable *AWS_REGION* in the build agent process's environment. Tasks running in build agents hosted on Amazon EC2
    instances (Windows or Linux) will also attempt to obtain the region using the instance metadata associated with the EC2 instance
    if no region is configured on the task or set in the environment variable.

Arguments
---------

    Optional arguments to pass to the script. You can use ordinal or named parameters.

Script Source*
--------------

    The type of script to run. Choose :guilabel:`Script File` to run a script that is contained in a file.
    Choose :guilabel:`Inline Script` to enter the script to run in the task configuration.

Script Path*
------------

    Required if the :code:`Script Source` parameter is set to :guilabel:`Script File`.
    Specify the full path to the script you want to run.

Inline Script*
--------------

    Required if the :code:`Script Source` parameter is set to :guilabel:`Inline Script`. Enter the text of the
    script to run.

ErrorActionPreference
---------------------

    Prepends the line `$ErrorActionPreference = 'VALUE'` at the top of your script.

Advanced
--------

Fail on Standard Error
~~~~~~~~~~~~~~~~~~~~~~

    If this option is selected, the task will fail if any errors are written to the error pipeline, or
    if any data is written to the Standard Error stream. Otherwise, the task relies on the exit code to determine failure.

Ignore $LASTEXITCODE
~~~~~~~~~~~~~~~~~~~~

    If this option is not selected, the line `if ((Test-Path -LiteralPath variable:\\LASTEXITCODE)) { exit $LASTEXITCODE }` is appended to the end of your script. This causes the last exit code from an external command to propagate as the exit code of PowerShell. Otherwise, the line is not appended to the end of your script.

Working Directory
~~~~~~~~~~~~~~~~~

    The working directory where the script runs.

