.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _lambda-deploy:

###############################
|LAMlong| .NET Core Deployment
###############################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

Build and deploy a .NET Core |LAMlong| function.

Description
===========

Lambda-based applications (also referred to as serverless applications) are composed of functions 
triggered by events. A typical serverless application consists of one or more functions triggered 
by events such as object uploads to Amazon S3, Amazon SNS notifications, and API actions. Those 
functions can stand alone or leverage other resources such as DynamoDB tables or Amazon S3 buckets. 
The most basic serverless application is simply a function.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.


Displayname*
------------
    
    By default the name of the task, |LAMlong| .NET Core Deployment. You can rename it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on :guilabel:`+`, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|.  

Path to Lambda Project*
-----------------------

    The relative path to the location of the Lambda project.

Command*
--------

    Either *Lambda Deploy* or *Serverless Deploy*.
    
    *Lambda Deploy* performs a single Lambda function deloyment.
    *Serverless Deploy* performs a deployment with AWS CloudFormation allowing multiple function deployment.
    
Lambda Deploy Command: Lambda Function Properties
-------------------------------------------------
		
Function Name
~~~~~~~~~~~~~

    The name of the Lambda function to invoke. You can also specify the |arnlong| (ARN) 
    of the function.

Function Role
~~~~~~~~~~~~~

    The name of the |IAMlong| Role that provides access to AWS services to the deployed Lambda function.

Function Handler
~~~~~~~~~~~~~~~~

    The function within your code that Lambda calls to begin execution. Format is 
    :code:`<assembly-name>::<type-name>::<function-name>`.

Function Memory (MB)
~~~~~~~~~~~~~~~~~~~~

    Memory allocated to the Lambda function. The value must be in multiples of 64.

Function Timout (Seconds)
~~~~~~~~~~~~~~~~~~~~~~~~~

    The function execution time at which Lambda should terminate the function.

Serverless Deploy Command: Serverless Application Properties
------------------------------------------------------------
		
Stack Name
~~~~~~~~~~

    |CFNlong| stack name. A stack is a collection of AWS resources that you can manage as a single unit

S3 Bucket
~~~~~~~~~

    S3 bucket used to store the built project.

S3 Prefix
~~~~~~~~~

    S3 object key prefix used for the objects uploaded to S3.


Advanced
--------
		
Additional Lambda Tools Command Line Arguments
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Additional arguments when executing the 'dotnet lambda' command


