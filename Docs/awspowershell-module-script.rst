.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _awspowershell-module-script:

#######################################
AWS Tools for Windows PowerShell Script
#######################################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

Runs a PowerShell script that uses cmdlets from the |TWPlong| module.

Description
===========

This task accepts a PowerShell script that uses cmdlets from the |TWP| module to interact with AWS services. The script
to run can be specified via its filename or can be entered into the task configuration. When running on Microsoft Windows build agents
the task can optionally install the |TWP| module before running the script. Note that if an install is performed, the module is
installed in 'current user' scope and the location is compatible with automatic module load. You do not therefore need to import the
module in your script.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters
are noted by an '*', the others are optional.

Name*
-----

    By default the name of the task, 'AWS Tools for Windows PowerShell Script'.

AWS Credentials*
----------------
    
    Select the AWS credentials to be used by the cmdlets in the module. If needed, click on +, and add a new AWS connection.

AWS Region*
-----------

    Name of the AWS region to be used by the cmdlets in the module, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|.

Type*
------

    Select 'File Path' to run a script contained in a file. Select 'Inline Script' to enter the script to run in the task configuration.

Script Path*
------------

    This parameter is required if the 'Type' parameter is set to 'File Path'. Specify the full path to the script to be run.

Inline Script*
--------------

    This parameter is required if the 'Type' parameter is set to 'Inline Script'. Enter the text of the script to be run.

Arguments
---------

   Optional arguments to pass to the script. You may use either ordinal or named parameters.

Automatically install the tools
-------------------------------

    Applies to build agents running on Microsoft Windows only. If selected the task will check to determine if the |TWP| module
    is already available and if not will attempt to install it from the `PowerShell Gallery <https://www.powershellgallery.com/packages/AWSPowerShell>`_
    to the current user scope location.

