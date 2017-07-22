.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

#####################################
Using the AWS Tools for Team Services
#####################################

.. meta::
   :description: Programming information for the AWS Tools for Team Servicesa
   :keywords:  AWS, CodeDeploy, Visual Studio Team Services Marketplace

The following tutorial demonstrates how to create and run a project using the AWS CodeDeploy Application Deployment task.

The scenario is developers at an enterprise that uses Visual Studio Team Services to host source code 
and build/release pipelines want to deploy their builds to Amazon EC2 instances using AWS CodeDeploy. 

Prerequisites
=============

* Either a Visual Studio Team Services account or Team Foundation Services locally installed.
* An AWS account and preferably an associated IAM user account.
* An S3 bucket.

To Install the AWS Extension for Visual Studio Team Services
============================================================

Starting in the `Visual Studio Marketplace <https://marketplace.visualstudio.com/>`_
search on :samp:`AWS Tools`. The search results finds an extension published by Amazon Web Services 
that contains a set of build tasks for AWS. If using Visual Studio Team Services online, click the :guilabel:`Install` 
button to have the extension installed into your account. If using an on-premise Team Foundation Services setup, 
click :guilabel:`Download` to install the extension locally.

       .. image:: images/AWSVSTSdownload.png
          :alt: Download VSTS Extension

To Create and Run a Project Using the AWS CodeDeploy Application Deployment Task
================================================================================

#.  Navigate to your Projects home page and set up a simple ASP.Net Core project to test the tasks before 
    starting to use in the your real-world pipelines. Choose to have the code hosted in Team Services and complete 
    setup of the initial project, including submitting a sample app generated within Visual Studio on 
    your workstation. The test environment is now ready to have a build pipeline defined.

#.  From the top menu bar in the project homepage click the :guilabel:`Build & Release link` to go to the Build Definitions 
    page for the project. Click the :guilabel:`New` button to generate a new build pipeline and select the ASP.NET Core 
    template to get started. This provides a default pipeline with the following tasks pre-defined:
    
    *  Get Sources
    *  Restore (restores .NET dependencies from NuGet)
    *  Build
    *  Test
    *  Publish
    *  Publish build artifacts

#.  Click the :guilabel:`Add` Task button in the pipeline to browse to and select the :samp:`Archive files` 
    task that came with VSTS.  Drag it to the second position in the build process following *Get sources*.
    
#.  Click the :guilabel:`Add` Task button in the pipeline to browse to and select the :samp:`AWS S3 Upload` 
    task that was contained in the AWS Tools extension you installed. Clicking on the new task that was 
    added to the pipeline, drag it to follow the *Archive file* step and open the task parameters window.

    1. The first parameter is labelled *AWS Credentials*. Click the + button to the right of the field and a 
       Team Services dialog appears asking you to enter your AWS access key and secret key credentials, and to give 
       the credentials a name. We suggest not using your root credentials but using the credentials associated 
       with an IAM user account. The secret key text is automatically masked. Click :guilabel:`OK` to save the credentials 
       into your Team Services account and return to the configuration of the new task. The name for the new credentials 
       has been entered into the AWS Credentials field.

    2. Enter the rest of the parameters for the task. The task needs the region in which to call 
       S3 and the application and the bucket name. 


#.  Click the :guilabel:`Save & queue` button for the pipeline.

    The build is queued, followed by console output from the pipeline as each task runs. You can see the 
    tasks you selected get downloaded to the build host and then run by the agent. Inspecting the console, 
    notice in the S3 task echo what it is uploading and where. Verify that the bucket contains the uploaded file.

