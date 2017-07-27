.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _codedeploy-deployment:

###################
|CDlong| Deployment
###################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

Deploy an application to |EC2| instance(s) using |CDlong|.

Description
===========

You can deploy a nearly unlimited variety of application content, such as code, web and configuration files, 
executables, packages, scripts, multimedia files, and so on. |CDlong| can deploy application 
content stored in |S3| buckets, GitHub repositories, or Bitbucket repositories. You do not need 
to make changes to your existing code before you can use |CDlong|.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.


Displayname*
------------
    
    By default the name of the task, |CDlong| Deployment. You can rename it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on :guilabel:`+`, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|. 

Application Name*
-----------------
    
    The name of the |CDlong| application.

Deployment Group Name*
----------------------
    
    The name of the deployment group the revision will be deployed to

Revision Bundle*
----------------

    The location of the archive bundle containing the application revision artifacts to be deployed 
    (including the appspec.yml file). The task will upload this archive to S3 before requesting the 
    deployment be performed.
    
Bucket Name*
------------

    The name of the bucket to which the revision bundle will be will be uploaded.

Target Folder
-------------

    Optional folder (key prefix) for the uploaded revision bundle in the bucket. If not specified the 
    bundle will be uploaded to the root of the bucket.

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

    If checked deploys to only those instances that are not running the latest application revision. 
    Default: not checked.

Ignore Application Stop Failures
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    If checked then if the deployment causes the ApplicationStop deployment lifecycle event to an 
    instance to fail, the deployment to that instance will not be considered to have failed at that 
    point and will continue on to the BeforeInstall deployment lifecycle event. Default: not checked.
        
Output
------
            
Output Variable
~~~~~~~~~~~~~~~
        
        The name of the variable that will contain the deployment ID on task completion. The variable 
        can be used as $(variableName) to refer to the function result in subsequent tasks.
        
        