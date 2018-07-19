.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _codedeploy-deployment:
.. _IAMRolesForEC2: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html

####################################
|CDlong| Deployment Application Task
####################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Deploys an application to |EC2| instances by using |CDlong|.

Description
===========

This can be a variety of application content, such as code, web and configuration files,
executable files, packages, scripts, and multimedia files.

Parameters
==========

You can set the following parameters for the task. Required
parameters
are noted by an asterisk (*). Other parameters are optional.


Display name*
-------------

    The default name of the task instance, which can be modified: Deploy with CodeDeploy

AWS Credentials
---------------

    Specifies the AWS credentials to be used by the task in the build agent environment.

    You can specify credentials using a service endpoint (of type AWS) in the task configuration or you can leave unspecified. If
    unspecified the task will attempt to use credentials set in environment variables in the build agent process or, if the build agent
    is running on an Amazon EC2 instance, the task can obtain and use credentials from the instance metadata associated with the EC2
    instance. For credentials to be available from EC2 instance metadata the instance must have been started with an instance profile
    referencing a role granting permissions to the task to make calls to AWS on your behalf. See
    IAMRolesForEC2_ for more information.

    When using environment variables in the build agent process you may use the standard AWS environment variables - *AWS_ACCESS_KEY_ID*,
    *AWS_SECRET_ACCESS_KEY* and optionally *AWS_SESSION_TOKEN*.

AWS Region
----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

    If a region is not specified in the task configuration the task will attempt to obtain the region to be used using the standard
    AWS environment variable *AWS_REGION* in the build agent process's environment. Tasks running in build agents hosted on Amazon EC2
    instances (Windows or Linux) will also attempt to obtain the region using the instance metadata associated with the EC2 instance
    if no region is configured on the task or set in the environment variable.

Application Name*
-----------------

    The name of the |CDlong| application.

Deployment Group Name*
----------------------

    The name of the deployment group the revision is to be deployed to.

Deployment Revision Source*
---------------------------

    Specifies the source of the revision to be deployed. You can select from:

    * *Folder or archive file in the workspace*: the task will create or use an existing zip archive in the location specified to *Revision Bundle*, upload the archive to Amazon S3 and supply the key of the S3 object to CodeDeploy as the revision source.
    * *Archive file in Amazon S3*: select to specify the key of an archive previously uploaded to Amazon S3 as the deployment revision source.

Revision Bundle*
----------------

    The location of the application revision artifacts to deploy. You can supply a filename or folder.
    If a folder is supplied the task will recursively zip the folder contents into an archive file
    before uploading the archive to |S3|. If a filename is supplied the task uploads it unmodified
    to |S3|. CodeDeploy requires the appspec.yml file describing the application to exist at the root
    of the specified folder or archive file.

    Required if *Deployment Revision Source* is set to *Folder or archive file in the workspace*.

S3 Bucket Name*
---------------

    The name of the Amazon S3 bucket to which the revision bundle is uploaded or can be found, if *Archive file in Amazon S3* was selected for *Deployment Revision Source*.

Target Folder
-------------

    Optional folder (key prefix) for the uploaded revision bundle in the bucket. If not specified the,
    bundle is uploaded to the root of the bucket.

    Available when *Folder or archive file in the workspace* is selected for *Deployment Revision Source*.

Revision Bundle Key
-------------------

    The Amazon S3 object key of the previously uploaded archive file containing the deployment revision artifacts.

    Required if *Deployment Revision Source* is set to *Archive file in Amazon S3*.

Description
-----------

    Optional description for the deployment.

Existing File Behavior
----------------------

    How |CDlong| should handle files that already exist in a deployment target location but weren't
    part of the previous successful deployment.

Advanced
--------

Update Outdated Instances Only
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    If checked, deploys to only those instances that are not running the latest application revision.

Ignore Application Stop Failures
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    When checked, if the deployment causes the ApplicationStop deployment lifecycle event to an
    instance to fail, the deployment to that instance is not considered failed at that
    point. It continues on to the BeforeInstall deployment lifecycle event.

Output
------

Output Variable
~~~~~~~~~~~~~~~

        The name of the variable that will contain the deployment ID on task completion. You can use the
        variable $(variableName) to refer to the function result in subsequent tasks.


