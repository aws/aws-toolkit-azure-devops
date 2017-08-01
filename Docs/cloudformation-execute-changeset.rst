.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _cloudformation-execute-changeset:

#################################
|CFNlong| Execute Change Set Task
#################################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks


Synopsis
========

Executes an |CFNlong| change set to create or update a stack.

Description
===========

When you execute a change set, |CFNlong| deletes all other change sets associated with the
stack because they aren't valid for the updated stack.

|CFNlong| updates a stack using the input information that was provided when the specified change set
was created.

If a stack policy is associated with the stack, |CFNlong| enforces the policy during the update.
You can't specify a temporary stack policy that overrides the current policy.

Parameters
==========

You can set the following parameters for the task. Required
parameters
are noted by an asterisk (*). Other parameters are optional.


Displayname*
------------

    The default name of the task, |CFNlong| Execute Change Set. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the
    |AWS-gr|.

Change Set Name*
----------------

    The name or |arnlong| (ARN) of the change set that you want to execute.

Stack Name
----------

    The name that is associated with the stack. The name must be unique in the region in which you
    are creating the stack.

    A stack name can contain only alphanumeric characters (case-sensitive) and hyphens. It must start
    with an alphabetic character and cannot be longer than 128 characters.


