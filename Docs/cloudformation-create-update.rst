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
         AWS Tools for Microsoft Visual Studio Team Services Task Reference

Synopsis
========

Creates a new |CFNlong| stack or updates the stack if it exists.

Description
===========

If the stack doesn't exist, this task creates a stack as specified in the parameters.
If the stack exists, this task updates a stack as specified in the parameters. When you need to change
a stack's
settings or its resources, update the stack instead of deleting it and creating
a new stack.

Parameters
==========

You can set the following parameters for the task. Required parameters
are noted by an asterisk (*). Other parameters are optional.


Displayname*
------------

    The default name of the task, |CFNlong| Create-Update Stack. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the|AWS-gr|.


Stack Name*
-----------

    The name that is associated with the stack. The name must be unique in the region in which you
    are creating the stack.

    A stack name can contain only alphanumeric characters (case-sensitive) and hyphens. It must start
    with an alphabetic character and cannot be longer than 128 characters.

Template File
-------------

    The path to the template file for the stack. For more information, see
    :CFN-ug:`Template Anatomy <template-anatomy>` in the |CFN-ug|.

Template Parameters File
------------------------

    The path to the file containing the template parameters.

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
        set. For example, :code:`AWS::EC2::Instance`, :code:`AWS::EC2::*`, or :code:`Custom::MyCustomInstance`.

        If the list of resource types doesn't include a resource type that you're updating, the stack
        update fails. By default, |CFNlong| grants permissions to all resource types.
        |IAM| uses this parameter for condition keys in |IAM| policies
        for |CFNlong|.

        For more information, see :CFN-ug:`Controlling Access with AWS Identity and Access Management <using-iam-template>` in the
        |CFN-ug|.

Notification ARNs
~~~~~~~~~~~~~~~~~

        The ARNs of |SNS| topics that |CFNlong| associates with
        the stack. To remove all associated notification topics, specify an empty list.

Options
-------

On Failure
~~~~~~~~~~

        Determines what action to take if stack creation fails.

        Default: *ROLLBACK*.

Disable Rollback
~~~~~~~~~~~~~~~~

        If checked, disables rollback of the stack if stack creation failed. You can specify either
        :code:`DisableRollback` or :code:`OnFailure`, but not both.

        Default: not checked.

Output Variable
~~~~~~~~~~~~~~~

        The name of the variable that will contain the ID of the stack on task completion. You can use
        the variable as :code:`$(variableName)` to refer to the stack ID in subsequent tasks.


