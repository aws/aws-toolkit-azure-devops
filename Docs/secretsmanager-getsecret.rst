.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _secretsmanager-getsecret:
.. _IAMRolesForEC2: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html

##############################
AWS Secrets Manager Get Secret
##############################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks


Synopsis
========

Stores the value of a secret in AWS Secrets Manager into a secret build variable.

Description
===========

Use this task to retrieve the value of a secret stored in AWS Secrets Manager and store it locally in a Team Services build variable. The
build variable will be automatically set to 'secret' mode to automatically mask the value when logged or otherwise displayed.

Parameters
==========

You can set the following parameters for the task. Required
parameters
are noted by an asterisk (*). Other parameters are optional.


Display name*
-------------

    The default name of the task instance, which can be modified: Secrets Manager Get Secret

AWS Credentials
---------------

    Specifies the AWS credentials to be used by the task in the build agent environment.

    You can specify credentials using a service endpoint (of type AWS) in the task configuration or you can leave unspecified. If
    unspecified the task will attempt to obtain credentials from the following sources in order:

    * From task variables named *AWS.AccessKeyID*, *AWS.SecretAccessKey* and optionally *AWS.SessionToken*.
    * From credentials set in environment variables in the build agent process. When using environment variables in the
      build agent process you may use the standard AWS environment variables: *AWS_ACCESS_KEY_ID*, *AWS_SECRET_ACCESS_KEY* and
      optionally *AWS_SESSION_TOKEN*.
    * If the build agent is running on an Amazon EC2 instance, from the instance metadata associated with the EC2 instance. For
      credentials to be available from EC2 instance metadata the instance must have been started with an instance profile referencing
      a role granting permissions to the task to make calls to AWS on your behalf. See IAMRolesForEC2_ for more information.

AWS Region
----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

    If a region is not specified in the task configuration the task will attempt to obtain the region to be used using the standard
    AWS environment variable *AWS_REGION* in the build agent process's environment. Tasks running in build agents hosted on Amazon EC2
    instances (Windows or Linux) will also attempt to obtain the region using the instance metadata associated with the EC2 instance
    if no region is configured on the task or set in the environment variable.

    **Note:** The regions listed in the picker are those known at the time this software was released. New regions that are not listed
    may still be used by entering the *region code* of the region (for example *us_west_2*).

Secret ID/Name
--------------

    Specifies the secret containing the version that you want to retrieve. You can specify either the |ARNLong| (ARN) or the friendly name of the secret.

Version ID
----------

    Specifies the unique identifier of the version of the secret that you want to retrieve. If you specify this parameter then don't specify *Version Stage*. If you don't specify either a *Version Stage* or *Version ID* then the default is to perform the operation on the version with the version stage value of *AWSCURRENT*.

Version Stage
-------------

    Specifies the version of the secret that you want to retrieve using the staging label attached to the version.

    Staging labels are used to keep track of different versions during the rotation process. If you use this parameter then don't specify *Version ID*. If you don't specify either a *Version Stage* or *Version ID*, then the default is to perform the operation on the version with the version stage value of *AWSCURRENT*.

