.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _ecr-pushimage:

############################################
Amazon Elastic Container Registry Push Image
############################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Pushes a Docker image identified by name, with optional tag, or image ID to the Elastic Container Registry (ECR).

Description
===========

This task pushes a Docker image to the Elastic Container Registry. The image to push can be identified using its
image ID or by name, with optional tag suffix. The task handles the work of appropriately tagging the image as required
by ECR and also the login process to your registry prior to executing the Docker Push command.

Parameters
==========

You can set the following parameters for the task. Required parameters are noted by an asterisk (*). 
Other parameters are optional.

Displayname*
------------

    The default name of the task, AWS Systems Manager Get Parameter. You can rename it or append the name of the
    associated Parameter Store parameter or parameter path to it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the
    |AWS-gr|.

Image Identity*
---------------

    How the image to be pushed is identified. You can select from either the image ID or the image name. If name
    is selected, a tag can also be specified.

Source Image Name
-----------------

    Required if Image Identity is set to image name. Specifies the name of the image to push.

Source Image Tag
----------------

    Optional tag that can be suffixed to the image name. If a tag is not specified, 'latest' is assumed.

Source Image ID
---------------

    Required if Image Identity is set to image ID. The ID of the image to push.

Target Repository Name*
-----------------------

    The name of the repository to which the image will be pushed.

Target Repository Tag
---------------------

    Optional tag for the new image in the repository. If not specified, ECR will assume 'latest'.

Create repository if it does not exist
--------------------------------------

    If checked, the task will check to see if the repository exists and if it does not, will attempt to create it.

Image Tag Output Variable
-------------------------

    The name of a build variable that will be created or updated with the pushed image reference. 
    The image tag will be of the form *aws_account_id.dkr.ecr.region.amazonaws.com/imagename*, 
    where **imagename** is in the format *repositoryname[:tag]*
