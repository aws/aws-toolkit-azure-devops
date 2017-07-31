.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _cloudformation-create-update:

##################################
|CFNlong| Create-Update Stack Task
##################################

.. meta::
    :description:
         Welcome to the AWS Tools for Visual Studio Team Services Guide

Synopsis
========

Creates a new |CFNlong| stack or updates the Stack if it exists.

Description
===========

If the stack does not exist, creates a stack as specified in the parameters. 	
If the stack exists, updates a stack as specified in the parameters. When you need to make changes 
to a stack's settings or change its resources, you update the stack instead of deleting it and creating 
a new stack. 

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.


Displayname*
------------
    
    By default the name of the task, |CFNlong| Create/Update Stack. You can rename it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on :guilabel:`+`, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|. 

Stack Name*
-----------
    
    The name that is associated with the stack. The name must be unique in the region in which you 
    are creating the stack.

    A stack name can contain only alphanumeric characters (case sensitive) and hyphens. It must start 
    with an alphabetic character and cannot be longer than 128 characters.

Template File
-------------
    
    Path to the template file for the stack. For more information, see the 
    :CFN-ug:`Template Anatomy <template-anatomy>` in the |CFN-ug|.

Template Parameters File
------------------------

    Path to the file containing the template parameters. 

Advanced
--------

Role ARN
~~~~~~~~
        
        The |arnlong| (ARN) of an |IAMlong| (|IAM|) role that 
        |CFNlong| assumes when executing the change set. |CFNlong| uses the role's 
        credentials to make calls on your behalf. |CFNlong| uses this role for all future 
        operations on the stack. As long as users have permission to operate on the stack, 
        |CFNlong| uses this role even if the users don't have permission to pass it. 
        Ensure that the role grants least privilege.

        If you don't specify a value, |CFNlong| uses the role that was previously associated 
        with the stack. If no role is available, |CFNlong| uses a temporary session that 
        is generated from your user credentials.
        
Resource Types
~~~~~~~~~~~~~~
        
        The template resource types that you have permissions to work with if you execute this change 
        set, such as :code:`AWS::EC2::Instance`, :code:`AWS::EC2::*`, or :code:`Custom::MyCustomInstance`.

        If the list of resource types doesn't include a resource type that you're updating, the stack 
        update fails. By default, |CFNlong| grants permissions to all resource types. 
        |IAMlong| (|IAM|) uses this parameter for condition keys in |IAM| policies 
        for |CFNlong|.

        For more information, see :CFN-ug:`Controlling Access with AWS Identity and Access Management <using-iam-template>` in the 
        |CFN-ug|.
        
Notification ARNs
~~~~~~~~~~~~~~~~~
        
        The |arnlong| (ARNs) of |SNSlong| (|SNS|) topics that |CFNlong| associates with 
        the stack. To remove all associated notification topics, specify an empty list.
        
Options
-------
    
On Failure
~~~~~~~~~~
        
        Determines what action will be taken if stack creation fails. Default: *ROLLBACK*
        
Disable Rollback
~~~~~~~~~~~~~~~~
        
        Check to disable rollback of the stack if stack creation failed. You can specify either 
        DisableRollback or OnFailure, but not both.  Default: Not checked,
        
Output Variable
~~~~~~~~~~~~~~~
        
        The name of the variable that will contain the ID of the stack on task completion. The variable 
        can be used as :code:`$(variableName)` to refer to the stack ID in subsequent tasks.
        
        