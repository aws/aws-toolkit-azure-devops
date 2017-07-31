.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

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
   :description: Using the tasks in the AWS Extensions to  Visual Studio Team System
   :keywords: extensions, tasks

Synopsis
========

Run a Shell or Batch Script with AWS Commands Against an AWS Connection.

Description
===========

The |CLI| uses a multipart structure on the command line. It starts with the base call to AWS. 
The next part specifies a top-level command, which often represents an AWS service supported in the 
|CLI|. Each AWS service has additional subcommands that specify the operation to perform. The 
general CLI options, or the specific parameters for an operation, can be specified on the command 
line in any order. If an exclusive parameter is specified multiple times, then only the last value applies.

.. code-block:: sh

        $ aws <command> <subcommand> [options and parameters]

Parameters can take various types of input values, such as numbers, strings, lists, maps, and JSON 
structures.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.


Displayname*
------------
    
    By default the name of the task, |CLI|. You can rename it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on :guilabel:`+`, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|. 

Command*
--------
    
    The |CLI| command to run. Run aws help in the |CLIlong| to get complete list of commands or see 
    :cli-ug:`CommandStructure <command-structure>` in the |CLIlong|.

Subcommand
----------
    
    The |CLI| subcommand to run. Run aws help in the |CLIlong| to get complete list of commands or see 
    :cli-ug:`CommandStructure <command-structure>` in the |CLIlong|.
    

Options and parameters
----------------------

    The arguments to pass to the |CLI| command. Run :code:`aws <command> --help` in the |CLIlong| to 
    get complete list of arguments supported by the command.

Advanced
--------

Fail on Standard Error
~~~~~~~~~~~~~~~~~~~~~~

    If this is true, this task will fail if any errors are written to the StandardError stream.
    
    

