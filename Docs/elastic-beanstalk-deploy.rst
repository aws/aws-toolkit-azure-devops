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

    This task deploys an application to |EC2| instances by using |EB|.

Description
===========

    This task deploys and scales web applications and services developed with Java, .NET, PHP, Node.js, Python,
    Ruby, Go, and Docker on familiar servers such as Apache, Nginx, Passenger, and IIS.

    |EB| automatically handles the deployment, from capacity provisioning, load balancing, and
    automatic scaling to application health monitoring.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.


Displayname*
------------

    The default name of the task, |EBlong| Deployment. You can rename it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the
    |AWS-gr|.


Application Type*
-----------------

    The type of application bundle to deploy. ASP.NET application deployments use Web Deploy archives. ASP.NET Core deployments are performed using the :code:`dotnet publish` command line tool.

Web Deploy Archive
------------------

    Required if :code:`Application Type` is set to :guilabel:`ASP.NET`. The path to the web deploy archive 
    that contains the application to deploy to |EB|.

Published Application Path
--------------------------

    Required if :code:`Application Type` is set to :guilabel:`ASP.NET Core`. The path to the directory where the
    command :code:`dotnet publish` outputs the published application.

Application Name*
-----------------

    The name of the |EB| application.

Environment Name*
-----------------

    The name of the |EB| environment that will run the application.

    An environment represents the AWS resources (e.g., load balancer, Auto Scaling group, and |EC2| instances)
    created specifically to run your application.





