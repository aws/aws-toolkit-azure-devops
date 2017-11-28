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
    :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Creates a new |CFNlong| stack or updates the stack if it exists.

Description
===========

Creates or updates a stack based on the specified parameters. When you need to change
a stack's settings or its resources, update the stack instead of deleting it and creating
a new stack.

Parameters
==========

You can set the following parameters for the task. Required parameters
are noted by an asterisk (*). Other parameters are optional.

Displayname*
------------

    The default name of the task, Create/Update Stack. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in
    the |AWS-gr|.


Stack Name*
-----------

    The name associated with the stack. The name must be unique in the region in which you
    are creating the stack.

    A stack name can contain only alphanumeric characters (case-sensitive) and hyphens. It must start
    with an alphabetic character and cannot be longer than 128 characters.

Template Source*
----------------

    Specifies the location of the template to use to create or update the stack. You can specify the template
    using the path to a file in the local file system, a URL to the file, or an object in Amazon S3.
    If you select an object in Amazon S3, you can specify the bucket and object name (key).

    Note that CloudFormation limits the size of template files uploaded to the service to 51,200 bytes. If your
    template is larger than the allowed size you should choose either the URL or Amazon S3 location options. You
    can also specify a bucket name for the local file option. If a bucket name is specified, the template is
    uploaded to the bucket by the task. The object key will be the template filename, less any path.

    When the task uploads the template to a bucket or you specify an Amazon S3 bucket name and object key,
    the task generates a URL to the object and supplies the URL to CloudFormation.

Template File*
--------------

    The path to the template file for the stack. For more information, see
    :CFN-ug:`Template Anatomy <template-anatomy>` in the |CFN-ug|.

Template Parameters File
------------------------

    The path to the file containing the template parameters.

Create or Update the Stack Using a Change Set
---------------------------------------------

    If checked, a change set containing a list of changes to apply to a stack will be 
    created and then validated. If the changes validate successfully, the change set can be executed
    to make the changes. You can choose to use a change set to create a new stack or update an 
    existing stack.

    Default: not checked.

Change Set Name
---------------

    This parameter is required if the option to use a change set is selected. Specifies the name of the
    change set to create, validate, and (optionally) execute to create or update the stack.

Description
-----------

    Optional description for the change set.

Automatically Execute the Change Set
------------------------------------

    If checked, the change set is automatically executed when validation succeeds. If it isn't checked
    the change set is validated but not executed. You can execute the change set later by using
    the :code:`|CFNlong| Execute Change Set` task.

    Default: checked.

Capabilities
------------

    You must specify capabilities before |CFNlong| can update certain stacks. Some stack
    templates might include resources that can affect permissions in your AWS account by, for example, 
    creating new AWS Identity and Access Management (IAM) users. For those stacks, you must explicitly
    acknowledge their capabilities by specifying this parameter.

Create or Update IAM Resources ('CAPABILITY_IAM')
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        If your stack manipulates IAM resources, you can specify either capability. Otherwise, an
        :code:`InsufficientCapabilities` error is returned.

        Default: checked.

Create or Update Named IAM Resources ('CAPABILITY_NAMED_IAM')
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        If your stack manipulates IAM resources with custom names, you must add this capability.
        Otherwise, an :code:`InsufficientCapabilities` error is returned.

        Default: checked.

Advanced
--------

Role ARN
~~~~~~~~

        The |arnlong| (ARN) of an |IAM| role that |CFNlong| assumes when it executes the 
        change set. |CFNlong| uses the role's credentials to make calls on your behalf. 
        |CFNlong| uses this role for all future operations on the stack. As long as users 
        have permission to operate on the stack, |CFNlong| uses this role even if the users 
        don't have permission to pass it. 
        
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
        |IAM| uses this parameter for condition keys in |IAM| policies for |CFNlong|.

        For more information, see :CFN-ug:`Controlling Access with AWS Identity and Access Management <using-iam-template>` in the
        |CFN-ug|.

Notification ARNs
~~~~~~~~~~~~~~~~~

        The ARNs of |SNS| topics that |CFNlong| associates with
        the stack. To remove all associated notification topics, specify an empty list.

Tags
~~~~

        Collection of tags to apply to the resources created by your template. Tags can be 
        specified as *tagkey=tagvalue*, one per line.

Options
-------

On Failure
~~~~~~~~~~

        Determines what action to take if stack creation fails.

        Default: *ROLLBACK*.

Disable Rollback
~~~~~~~~~~~~~~~~

        If checked, disables rollback of the stack if stack creation failed. You can specify
        :code:`DisableRollback` or :code:`OnFailure`, but not both.

        Default: not checked.

Output Variable
~~~~~~~~~~~~~~~

        The name of the variable that will contain the stack ID on task completion. You can use
        :code:`$(variableName)` to refer to the stack ID in subsequent tasks.

