.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. meta::
    :description:
         Welcome to the AWS Tools for Visual Studio Team Services Guide


###################################################
AWS Tools for Microsoft Visual Studio Team Services
###################################################


AWS Tools for Microsoft Visual Studio Team Services is an extension for Visual Studio Team Services that contains tasks you can use in
build and release definitions in VSTS and Microsoft Team Foundation Server (TFS) to interact with AWS services.
AWS Tools for VSTS is available through the `Visual Studio Marketplace <https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-vsts-tools>`_.

You can use these tasks in a VSTS project or in an on-premises Team Foundation Server environment.
The available AWS tasks include:

* Deployment tasks
    * |CDlong| Deploy Application Task
    * |CFNlong| Create/Update Stack Task
    * |CFNlong| Delete Stack Task
    * |CFNlong| Execute Change Set Task
    * |EBlong| Deployment Task
    * |ECRLong| Push Image Task
    * |LAMlong| Deployment Task
    * |LAMlong| .NET Core Deployment Task
    * |LAMlong| Invoke Function Task
* General purpose tasks
    * |CLI|
    * |TWPlong| Script Task
    * AWS Shell Script Task
    * AWS S3 Download Task
    * AWS S3 Upload Task
    * AWS Send Message Task
    * AWS Secrets Manager Create/Update Secret Task
    * AWS Secrets Manager Get Secret Task
    * AWS Systems Manager Get Parameter Task
    * AWS Systems Manager Set Parameter Task
    * AWS Systems Manager Run Command Task

What's in This Guide
====================

The AWS Tools for VSTS User Guide describes how to install and use the AWS Tools for VSTS.

:ref:`getting-started`

    How to set up a VSTS account, install the AWS Tools for VSTS
    and how to set up AWS credentials to use the tasks using either service endpoints, environment variables or Amazon EC2
    instance metadata (for build agents running on Amazon EC2 instances).

:ref:`tutorials`

    Walk-through topics demonstrating how to use tasks in the AWS Tools for VSTS in your build and release definitions.

:ref:`task_reference`

    Describes the tasks included in the AWS Tools for VSTS.


