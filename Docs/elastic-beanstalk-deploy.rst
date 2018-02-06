.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _elastic-beanstalk-deploy:

########################
|EBlong| Deployment Task
########################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

    This task deploys a new version of an application to an |EB| environment associated with the application.

Description
===========

    With |EB|, you can quickly deploy and manage applications in the AWS Cloud without worrying about the
    infrastructure that runs those applications. |EB| reduces management complexity without restricting
    choice or control. You simply upload your application, and |EB| automatically handles the details of
    capacity provisioning, load balancing, scaling, and application health monitoring.

    This task can deploy ASP.NET applications (as Web Deploy archives), ASP.NET Core applications, an existing built
    application or a previously registered application version using the |EB| Create Version task.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.


Displayname*
------------

    The default name of the task, |EBlong| Deployment. You can rename it.

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

Environment Name*
-----------------

    The name of the |EB| environment that will run the application.

    An environment represents the AWS resources (e.g., load balancer, Auto Scaling group, and |EC2| instances)
    created specifically to run your application.

Deployment Bundle Type*
-----------------------

    The type of application bundle to deploy. You can select from

    * ASP.NET: the deployment bundle is expected to be a Web Deploy archive, built previously, which the task will upload.
    * ASP.NET Core: the deployment bundle will be created by the task (using the :code:`dotnet publish` command line tool) and uploaded.
    * Existing deployment bundle: choose to deploy a bundle that has been built and uploaded previously to Amazon S3.
    * Existing application version: choose to deploy a revision previously registered with Elastic Beanstalk.

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

Version Label
-------------

    Version label for the new application revision. If not specified the task will construct a version label
    based on the current date and time, expressed in milliseconds (for example *v20171120222623*).


Version Label Output Variable
-----------------------------

    Optional variable name to which the version label for the revision will be stored on conclusion of the task. This is useful when
    :code:`Version Label` is not specified and the task generates a version label for the revision.  You can refer to this variable
    in subsequent build steps to obtain the deployed version label.
