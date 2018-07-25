.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _elastic-beanstalk-createversion:

############################
|EBlong| Create Version Task
############################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

    This task creates a new version of an application that can be deployed subsequently to an |EB| environment
    associated with the application.

Description
===========

    With |EB|, you can quickly deploy and manage applications in the AWS Cloud without worrying about the
    infrastructure that runs those applications. |EB| reduces management complexity without restricting
    choice or control. You simply upload your application, and |EB| automatically handles the details of
    capacity provisioning, load balancing, scaling, and application health monitoring.

    This task can upload and register new versions of ASP.NET applications (as Web Deploy archives), ASP.NET Core applications
    or an existing application bundle previously uploaded to Amazon S3. The application version can then be deployed separately
    to an |EB| environment associated with the application using the |EB| Deployment task.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.


Display name*
------------

    The default name of the task instance, which can be modified: Create Elastic Beanstalk Version

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

Application Name*
-----------------

    The name of the |EB| application.

Deployment Bundle Type*
-----------------------

    The type of application bundle for which a new revision will be created in {EB}. You can select from

    * ASP.NET: the deployment bundle is expected to be a Web Deploy archive, built previously, which the task will upload.
    * ASP.NET Core: the deployment bundle will be created by the task (using the :code:`dotnet publish` command line tool) and uploaded.
    * Existing deployment bundle: choose to deploy a bundle that has been built and uploaded previously to Amazon S3.

Web Deploy Archive
------------------

    Required if :code:`Deployment Bundle Type` is set to :guilabel:`ASP.NET`. The path to the web deploy archive
    containing the application to deploy to |EB|.

Published Application Path
--------------------------

    Required if :code:`Deployment Bundle Type` is set to :guilabel:`ASP.NET Core`. The output location where the _dotnet publish_ command in your previous build steps placed the deployment artifact(s) to be published. Configure using either:

    * The path to the output folder containing the artifacts. Use this if the _dotnet publish_ command in your build was configured to not create a zip file of the published application.
    * The path and filename of the zip file containing the artifacts. Use this if the _dotnet publish_ command in your build was configured to create a zip file of the application artifacts.

Deployment Bundle Bucket
------------------------

    Required if :code:`Deployment Bundle Type` is set to :guilabel:`Existing deployment bundle`. The name of the Amazon S3 bucket containing
    the revision bundle to deploy.

Deployment Bundle Object Key
----------------------------

    Required if :code:`Deployment Bundle Type` is set to :guilabel:`Existing deployment bundle`. The Amazon S3 object key of the revision bundle file
    to be deployed.

Description
-----------

    Optional description for the new revision.

Version Label
-------------

    Version label for the new application revision. If not specified the task will construct a version label
    based on the current date and time, expressed in milliseconds (for example *v20171120222623*).

Version Label Output Variable
-----------------------------

    Optional variable name to which the version label for the revision will be stored on conclusion of the task. This is useful when
    :code:`Version Label` is not specified and the task generates a version label for the revision.  You can refer to this variable
    in subsequent build steps to obtain the deployed version label.

Task Permissions
================

This task requires permissions to call the following AWS service APIs (depending on selected task options, not all APIs may be used):

  * elasticbeanstalk:CreateApplicationVersion
  * elasticbeanstalk:CreateStorageLocation
  * elasticbeanstalk:DescribeApplications
  * elasticbeanstalk:DescribeEnvironments

The task also requires permissions to upload your application content to the specified Amazon S3 bucket. Depending on the size of the application bundle, either putObject or the S3 multi-part upload APIs may be used.
