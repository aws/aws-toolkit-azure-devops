.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _awspowershell-module-script:

#####################
|TWPlong| Script Task
#####################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks, VSTS

Synopsis
========

Runs a PowerShell script that uses cmdlets from the |TWPlong| module.

Description
===========

This task accepts a PowerShell script that uses cmdlets from the |TWP| module to interact with AWS services.
You can specify the script to run via its file name, or you can enter it into the task
configuration. When the task runs on Windows build agents,
it can optionally install the |TWP| module before running the script.

.. note:: If an installation is performed, the module is installed in the :code:`current user`
         scope. The location is compatible with automatic module load. As a result, you don't
         need to import the module in your script.

Parameters
==========

You can set the following parameters for the task. Required parameters
are noted by an asterisk (*). Other parameters are optional.

Name*
-----

    The default name of the task, AWS Tools for Windows PowerShell Script.

AWS Credentials*
----------------

    The AWS credentials used by the cmdlets in the module. If needed, choose :guilabel:`+`,
    and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name used by the cmdlets in the module. For more information, see :aws-gr:`Regions
    and Endpoints <rande>` in the |AWS-gr|.

Type*
------

    The type of script to run. Choose :guilabel:`File Path` to run a script that is contained in a file.
    Choose :guilabel:`Inline Script` to enter the script to run in the task configuration.

Script Path*
------------

    Required if the :code:`Type` parameter is set to :guilabel:`File Path`.
    Specify the full path to the script you want to run.

Inline Script*
--------------

    Required if the :code:`Type` parameter is set to :guilabel:`Inline Script`. Enter the text of the
    script to run.

Arguments
---------

   Optional arguments to pass to the script. You can use ordinal or named parameters.

Automatically install the tools
-------------------------------

    Applies to build agents running on Windows only. If selected, the task checks whether
    the |TWP| module is already available. If it isn't, the task attempts to install it from
    the `PowerShell Gallery <https://www.powershellgallery.com/packages/AWSPowerShell>`_
    to the current user scope location.

