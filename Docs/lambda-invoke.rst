.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _lambda-invoke:

#########################
|LAMlong| Invoke Function
#########################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks       

Synopsis
========

Invoke an |LAMlong| function with a JSON payload.

Description
===========

Invokes a previously deployed Lambda function.	

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.


Displayname*
------------
    
    By default the name of the task, |LAMlong| Invoke Function. You can rename it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on :guilabel:`+`, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|.  

Function Name*
--------------

    The name of the Lambda function to invoke. You can also specify the |arnlong| (ARN) of the function.

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

    The name of the variable that will contain the function output on task completion. The variable 
    can be used as :code:`$(variableName)` to refer to the function result in subsequent tasks.

Log Type
~~~~~~~~

    For synchronous execution, returns the base64-encoded last 4 KB of log data produced by your Lambda 
    function in the x-amz-log-result header.
    
    
