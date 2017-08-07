.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _lambda-invoke:

##############################
|LAMlong| Invoke Function Task
##############################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

This task invokes an |LAMlong| function with a JSON payload.

Description
===========

This task invokes a previously deployed |LAM| function.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.

Displayname*
------------

    The default name of the task, |LAMlong| Invoke Function. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the
    |AWS-gr|.

Function Name*
--------------

    The name of the |LAM| function to invoke. You can also specify the |arnlong| (ARN) of the function.

Payload
-------

    The JSON formatted payload to pass to the function.

Invocation Type
---------------

    Either *Asynchronous execution* or *Synchronous execution returning the output from the function*.

Synchronous Execution Output
-----------------------------

Output Variable
~~~~~~~~~~~~~~~

    The name of the variable that will contain the function output on task completion. You can use the
    variable as :code:`$(variableName)` to refer to the function result in subsequent tasks.

Log Type
~~~~~~~~

    For synchronous execution, returns the base64-encoded last 4 KB of log data produced by your |LAM|
    function in the :code:`x-amz-log-result` header.


