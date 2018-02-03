.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

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


Displayname*
------------

    The default name of the task, |EBlong| Create Version. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to be used by the task when it executes on a build host. If needed, choose :guilabel:`+`, and then add a new
    AWS service endpoint connection.

AWS Region*
-----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

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

    Required if :code:`Deployment Bundle Type` is set to :guilabel:`ASP.NET Core`. The path to the directory where the
    command :code:`dotnet publish` outputs the published application.

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
