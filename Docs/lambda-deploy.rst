.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _lambda-deploy:

###################################
|LAMlong| .NET Core Deployment Task
###################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Builds and deploys a .NET Core |LAMlong| function or serverless application.

Description
===========

|LAM|-based applications (also referred to as serverless applications) are composed of functions
triggered by events. A typical serverless application consists of one or more functions triggered
by events such as object uploads to |S3|, |SNS| notifications, and API actions. Those
functions can stand alone or leverage other resources such as |DDBlong| tables or |S3| buckets.
The most basic serverless application is simply a function.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.

Displayname*
------------

    The default name of the task, |LAMlong| .NET Core Deployment. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the
    |AWS-gr|.

Path to |LAM| Project*
-----------------------

    The relative path to the location of the |LAM| project.

Command*
--------

    Either *Lambda Deploy* or *Serverless Deploy*.

    *Lambda Deploy* performs a single |LAM| function deloyment.
    *Serverless Deploy* performs a deployment with |CFNlong|, allowing a multiple function deployment.

|LAM| Deploy Command: |LAM| Function Properties
-----------------------------------------------

Function Name
~~~~~~~~~~~~~

    The name of the |LAM| function to invoke. You can also specify the |arnlong| (ARN)
    of the function.

Function Role
~~~~~~~~~~~~~

    The name of the |IAMlong| role that provides access to AWS services to the deployed |LAM| function.

Function Handler
~~~~~~~~~~~~~~~~

    The function within your code that |LAM| calls to begin execution. The format is
    :code:`<assembly-name>::<type-name>::<function-name>`.

Function Memory (MB)
~~~~~~~~~~~~~~~~~~~~

    The memory allocated to the |LAM| function. The value must be in multiples of 64.

Function Timout (Seconds)
~~~~~~~~~~~~~~~~~~~~~~~~~

    The function execution time at which |LAM| should terminate the function.

Serverless Deploy Command: Serverless Application Properties
------------------------------------------------------------

Stack Name
~~~~~~~~~~

    |CFNlong| stack name. A stack is a collection of AWS resources that you can manage as a single unit.

S3 Bucket
~~~~~~~~~

    The S3 bucket used to store the built project.

S3 Prefix
~~~~~~~~~

    The S3 object key prefix used for the objects uploaded to |S3|.


Advanced
--------

Additional |LAM| Tools Command Line Arguments
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Additional arguments you can use when executing the :code:`dotnet lambda` command.


