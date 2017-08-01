.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

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


AWS Tools for Team Services is a Visual Studio Team Services extension that contains AWS build tasks.
AWS Tools for Team Services is available through the `Visual Studio Marketplace <https://marketplace.visualstudio.com/>`_.

You can use these tasks in a Team Services project
or in an on-premises Team Foundation Services environment. Use the tasks to build
and release CI/CD pipelines to enable those pipelines to interact with AWS services. For example, a
release pipeline can use the |CDlong| Application Deployment task to deploy the output from a build
to a deployment group of |EC2| instances managed by |CDlong|. Other tasks enable you to transfer content
between |S3| buckets and the build area in the pipeline (upload and download), or to launch a |CFNlong|
stack or deploy to |AEBlong| environments.

What's in This Guide
====================

The *AWS Tools for Team Services User Guide* describes how to install and use the AWS extension for
Visual Studio Team Services.

:ref:`getting-started`

    How to set up a Visual Studio Team Services account, install the AWS extension for Team Services
    and how to set up AWS credentials to use the tasks in the extension.

:ref:`tutorials`

    Demonstrates how to create and run a Team Services project utilizing a task installed with the
    AWS extension for Visual Studio Team Services

:ref:`task_reference`

    Describes the tasks included in the AWS Tools for Team Services.


