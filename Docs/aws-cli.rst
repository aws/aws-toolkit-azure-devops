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
   :description: Using the tasks in the AWS Extensions to Visual Studio Team System
   :keywords: extensions, tasks

Synopsis
========

Runs a command using the AWS CLI. The AWS CLI must have been installed previously.

Description
===========

The |CLI| uses a multipart structure on the command line. It starts with the base call to AWS.
The next part specifies a top-level command, which often represents an AWS service supported in the
|CLI|. Each AWS service has additional subcommands that specify the operation to perform. You can specify
the
general CLI options, or the specific parameters for an operation, on the command
line in any order. If you specify an exclusive parameter multiple times,  only the last value
applies.

.. code-block:: sh

        <command> <subcommand> [options and parameters]

Parameters can take various types of input values such as numbers, strings, lists, maps, and JSON
structures.

Parameters
==========

You can set the following parameters for the task. Required
parameters
are noted by an asterisk (*). Other parameters are optional.


Displayname*
------------

    The default name of the task, |CLI|. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in
    the |AWS-gr|.

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



