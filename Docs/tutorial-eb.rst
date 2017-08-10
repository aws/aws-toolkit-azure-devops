.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _tutorial-eb:
   
###############################################
Using the AWS Elastic Beanstalk Deployment Task
###############################################

.. meta::
   :description: Programming information for the AWS Tools for VSTSa
   :keywords:  AWS, S3, Visual Studio Team Services Marketplace

The following tutorial demonstrates how to create and run a Visual Studio Team Services (VSTS) project 
which uses the *AWS Elastic Beanstalk Deployment* task.

Prerequisites
=============

* The AWS Tools for VSTS installed in VSTS or an on-premises Team Foundation Server.
* An AWS account and preferably an associated IAM user account.
* An Elastic Beanstalk application and environment.


To Create and Run a Project Using the |AEBlong| Deployment Task
===========================================================================

Set Up a New Project and Build Process 
--------------------------------------

The tutorial assumes the use of the *ASP.NET Core (.NET Framework)* template.  

       .. image:: images/choose-template.png
          :alt: Select a template
          
On the *Build Process* page set the Default agent queue field to *Hosted VS2017*.  Remove the 
*Publish Artifact* task from the end of the build definition. It is not needed since you are deploying 
to |AEB|.

       .. image:: images/build-definition.png
          :alt: Build Definition
        
          
Add the AWS Elastic Beanstalk Deployment Task to the Build Definition
---------------------------------------------------------------------

Click the :guilabel:`Add Task` link. In the right hand panel, scroll through the available tasks until 
you see the AWS Elastic Beanstalk Deployment task. Click the :guilabel:`Add` button to add it to bottom 
of the build definition.

       .. image:: images/elastic-beanstalk-task-in-list.png
          :alt: AWS Elastic Beanstalk Deployment Task
          
Click on the new task and you will see the properties for it in the right pane.

       .. image:: images/build-process-list-eb.png
          :alt: AWS Elastic Beanstalk Deployment Task in Position
          
Configure the Task Properties
-----------------------------

For the new task you need to make the following configuration changes.

* AWS Credentials: If you have existing AWS credentials for this task in the Services page endpoints 
  list you can select them by clinking the gear icon to the right of the  AWS Credentials field.  
  If not, to quickly add credentials for this task, click the :guilabel:`+` link.

       .. image:: images/credentialsfield.png
          :alt: AWS Credential Field

  This opens the :guilabel:`Add new AWS Connection` form.
  
       .. image:: images/credentialdialog.png
          :alt: AWS Credential Dialog
          
  This task requires credentials for a user with a policy enabling the user to update a Beanstalk 
  environment and describe an environment status and events. Enter the access key and secret keys for 
  the credentials you want to use and assign a name that you will remember.
  
    .. note::

        We recommend that you do not use your account's root credentials. Instead, create one or more 
        IAM users, and then use those credentials. For more information, see 
        `Best Practices for Managing AWS Access Keys <https://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html>`_.

          
  Click :guilabel:`OK` 
  to save them. The dialog will close and return to the Elastic Beanstalk Deployment Task configuration 
  with the new credentials selected.

       .. image:: images/credentialssavedEB.png
          :alt: AWS Credential Dialog

* AWS Region: The AWS region that that the Beanstalk environment is running in.
* Application Type: Set to ASP.NET
* Web Deploy Archive: The path to the Web Deploy archive. If the archive was created using the arguments 
  above, the file will have the same name as the directory containing the web application and will 
  have a ".zip" extension. It can be found in the build artifacts staging directory which can be 
  referenced as :code:`$(build.artifactstagingdirectory)`.
* Beanstalk Application Name: The name you used to create the Beanstalk application. A Beanstalk 
  application is the container for the environment for the .NET web application.
* Beanstalk Environment Name: The name you used to create the Beanstalk environment. A Beanstalk 
  environment contains the actual provisioned resources that are running the .NET web application.
          

    
Run the Build
-------------

With the new task configured you are ready to run the build. Click the Save and queue option.  When 
the build has completed running you should see a log similar to this. 

       .. image:: images/build-succeeded-log.png
          :alt: Build Log
          



          