.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

##########################################################
Using the AWS Tools for Visual Studio Team Services (VSTS)
##########################################################

.. meta::
   :description: Programming information for the AWS Tools for Visual Studio Team Servicesa
   :keywords:  AWS, CodeDeploy, Visual Studio Team Services Marketplace

The following tutorial demonstrates how to create and run a project using the AWS CodeDeploy Application Deployment task.

The scenario is developers at an enterprise that uses Visual Studio Team Services to host source code 
and build/release pipelines want to deploy their builds to Amazon EC2 instances using AWS CodeDeploy. 

Prerequisites
=============

* Either a Visual Studio Team Services account or Team Foundation Services locally installed.
* An AWS account and preferably an associated IAM user account.
* A CodeDeploy deployment group.
* An S3 bucket.

To Install the AWS Extension for Visual Studio Team Services
============================================================

Starting in the `Visual Studio Marketplace <https://marketplace.visualstudio.com/>`_
search on several terms, :samp:`AWS`, :samp:`CodeDeploy` and :samp:`EC2`. The 
top entry in the search results points to an extension published by Amazon Web Services that contains 
a set of build tasks that the functionality needed. If using VSTS online, click the :guilabel:`Install` button to 
have the extension installed into your account. If using an on-premise Team Foundation Services setup, 
click :guilabel:`Download` to install the extension locally.

To Create and Run a Project Using the AWS CodeDeploy Application Deployment Task
================================================================================

#.  Navigate to your Projects home page and set up a simple ASP.Net Core project to test the tasks before 
    starting to use in the your real-world pipelines. Choose to have the code hosted in VSTS and complete 
    setup of the initial project, including submitting a sample app generated within Visual Studio on 
    your workstation. The test environment is now ready to have a build pipeline defined.

#.  From the top menu bar in the project homepage click the :guilabel:`Build & Release link` to go to the Build Definitions 
    page for the project. Click the :guilabel:`New` button to generate a new build pipeline and select the ASP.NET Core 
    template to get started. This provides a default pipeline with the following tasks pre-defined:
    
    1.  Get Sources
    2.  Restore (restores .NET dependencies from NuGet)
    3.  Build
    4.  Test
    5.  Publish
    6.  Publish build artifacts

#.  Add a step after 5, Publish, to gather up the built artifacts and push them to CodeDeploy. you need a 
    CodeDeploy deployment group to receive the artifacts, and an appspec.yml file that will work for the 
    test application.

#.  Click the :guilabel:`Add` Task button in the pipeline to browse to and select the :samp:`AWS CodeDeploy Application Deployment` 
    task that was contained in the AWS Tools extension you installed. Clicking on the new task that was 
    added to the pipeline, drag it to follow step 5 and open the task parameters window.

    1. The first parameter is labelled *AWS Credentials*. Click the + button to the right of the field and a 
       VSTS dialog appears asking you to enter your AWS access key and secret key credentials, and to give 
       the credentials a name. We suggest not using your root credentials but using the credentials associated 
       with an IAM user account. The secret key text is automatically masked. Click :guilabel:`OK` to save the credentials 
       into your VSTS account and return to the configuration of the new task. The name for the new credentials 
       has been entered into the AWS Credentials field.

    2. Enter the rest of the parameters for the task. The task needs the region in which to call 
       CodeDeploy and the application and deployment group names. The task also requires the name of the application 
       bundle and the S3 bucket in which it is stored. 

#.  Leave the CodeDeploy task configuration and add two additional tasks into the pipeline, one to zip 
    up the deployment bundle and one to upload the bundle to S3.

    1. Add the zip task (built into VSTS) to zip up the bundle.
    
    2. Add the S3 Upload task from the available AWS tasks. This task also needs AWS credentials. 
       Select the same credentials, by name, that you defined earlier and complete the rest of the task parameters. 
       Set the bucket name, the source folder (in the VSTS build system) where the zipped bundle exists, the 
       name of the bundle file and the target folder (key) in the S3 bucket for the bundle. Leave the ACL for 
       the uploaded object at its default setting of **private**.

#.  Return to the partially configured CodeDeploy task and complete the remaining fields so that CodeDeploy 
    will deploy the bundle the previous step has uploaded to S3. With all parameters completed, you are 
    ready to start a test build. Click the :guilabel:`Save & queue` button for the pipeline.

#.  The build is queued, followed by console output from the pipeline as each task runs. You can see the 
    tasks you selected get downloaded to the build host and then run by the agent. Inspecting the console, 
    notice the S3 task echo what it is uploading and where, followed by the CodeDeploy task output. Verify 
    that the EC2 instances contain the newly deployed application.

