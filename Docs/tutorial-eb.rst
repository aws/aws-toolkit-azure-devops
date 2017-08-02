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
   :description: Programming information for the AWS Tools for Team Servicesa
   :keywords:  AWS, S3, Visual Studio Team Services Marketplace

The following tutorial demonstrates how to create and run a Team Services project which uses the AWS 
Elastic Beanstalk Deployment Task.

Prerequisites
=============

* Either a Visual Studio Team Services account or Team Foundation Services locally installed.
* The AWS Extension for Visual Studio Team Services installed in Team Services.
* An AWS account and preferably an associated IAM user account.
* An Elastic Beanstalk applicaion and environment.


To Create and Run a Project Using the AWS Elastic Beanstalk Deployment Task
===========================================================================

Set Up a New Project and Build Process 
--------------------------------------

Create a VSTS project as described in :guilabel:`Create a Project To Use AWS Tasks` in :ref:`tutorials`.  

On the *Choose a template* page select the *ASP.NET Core (.NET Framework)* template.  

       .. image:: images/choose-template.png
          :alt: Select a template
          
On the *Build Process* page set the Default agent queue field to *Hosted VS2017*.  Remove the 
*Publish Artifact* task from the end of the build definition.

       .. image:: images/build-definition.png
          :alt: Build Definition
        
          
Add the AWS Elastic Beanstalk Deployment Task to the Pipeline
-------------------------------------------------------------- 

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

For the new task you need to make the following configurations changes.

* AWS Credentials: To quickly add credentials for this task, click the :guilabel:`+` link to the 
  right of the AWS Credentials field.

       .. image:: images/credentialsfield.png
          :alt: AWS Credential Field

  Having clicked the :guilabel:`+` link a dialog window appears in which you can enter your AWS keys.
  
    .. note::

        We recommend that you do not use your account's root credentials. Instead, create one or more 
        IAM users, and then use those credentials. For more information, see 
        `Best Practices for Managing AWS Access Keys <https://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html>`_.

       .. image:: images/credentialdialog.png
          :alt: AWS Credential Dialog
          
  For this task the credentials should be for an Identity and Access Management user with an policy 
  enabling the user to update a Beanstalk environment and describe an environment status and events.
  Enter the access key and secret keys for the credentials you want to use and assign a name that 
  you will remember, then click :guilabel:`OK` to save them. The dialog will close and return to the 
  Elastic Beanstalk Deployment Task configuration with the new credentials selected.

       .. image:: images/credentialssaved.png
          :alt: AWS Credential Dialog

* AWS Region: The AWS region that that the Beanstalk environment is running in.
* Application Type: Set to ASP.NET
* Web Deploy Archive: The path to the Web Deploy archive. If the archive was created using the arguments 
  above, the file will have the same name as the directory containing the web application and will 
  have a ".zip" extension. It can be found in the build artifacts staging directory which can be 
  referenced as :code:`$(build.artifactstagingdirectory)`.
* Beanstalk Application Name: The name you used to create the Beanstalk application. A Beanstalk 
  application is the container of a collection environments running the .NET web application.
* Beanstalk Environment Name: The name you used to create the Beanstalk environment. A Beanstalk 
  environment contains the actual provisioned resources that are running the .NET web application.
          

    
Run the Build
-------------

With the new task configured you are ready to run the build. Click the Save and queue option.  When 
the build has completed running you should see a log similar to this. 

       .. image:: images/build-succeeded-log.png
          :alt: Build Log
          



          