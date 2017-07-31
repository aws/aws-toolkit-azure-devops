.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _elastic-beanstalk-deploy:

###################
|EBlong| Deployment
###################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

    Deploys an application to |EC2| instance(s) using |EB|.

Description
===========

    Deploy and scale web applications and services developed with Java, .NET, PHP, Node.js, Python, Ruby, Go,
    and Docker on familiar servers such as Apache, Nginx, Passenger, and IIS.
    
    |EB| automatically handles the deployment, from capacity provisioning, load balancing, 
    auto-scaling to application health monitoring.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.


Displayname*
------------
    
    By default the name of the task, |EBlong| Deployment. You can rename it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on :guilabel:`+`, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|. 

Web Deploy Archive*
-------------------

    The path to web deploy archive that contains the application to deploy to |EB|.

Beanstalk Application Name*
---------------------------

    The name of the |EB| application.
    
|EB| Environment Name*
-----------------------------------

    The name of the |EB| environment that will run the application.
    
    An environment represents the AWS resources (e.g. load balancer, Auto Scaling group, and EC2 instances) 
    created specifically to run your application. 





