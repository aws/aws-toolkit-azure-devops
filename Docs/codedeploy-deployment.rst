.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _codedeploy-deployment:

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


Displayname*
------------

    The default name of the task, |CDlong| Deployment. You can rename it.

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

    The name of the |CDlong| application.

Deployment Group Name*
----------------------

    The name of the deployment group the revision is deployed to.

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

Bucket Name*
------------

    The name of the bucket to which the revision bundle is uploaded or can be found, if *Archive file in Amazon S3* was selected for *Deployment Revision Source*.

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

    Default: not checked.

Ignore Application Stop Failures
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    When checked, if the deployment causes the ApplicationStop deployment lifecycle event to an
    instance to fail, the deployment to that instance is not considered failed at that
    point. It continues on to the BeforeInstall deployment lifecycle event.

    Default: not checked.

Output
------

Output Variable
~~~~~~~~~~~~~~~

        The name of the variable that will contain the deployment ID on task completion. You can use the
        variable $(variableName) to refer to the function result in subsequent tasks.


