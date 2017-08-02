.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _tutorial-s3:
   
############################
Using the AWS S3 Upload Task
############################

.. meta::
   :description: Programming information for the AWS Tools for Team Servicesa
   :keywords:  AWS, S3, Visual Studio Team Services Marketplace

The following tutorial demonstrates how to create and run a Team Services project which uses the AWS S3 Upload task.

Prerequisites
=============

* Either a Visual Studio Team Services account or Team Foundation Services locally installed.
* The AWS Extension for Visual Studio Team Services installed in Team Services.
* An AWS account and preferably an associated IAM user account.
* An S3 bucket.

To Create and Run a Project Using the AWS S3 Upload Task
========================================================

Create a VSTS project as described in :guilabel:`Create a Project To Use AWS Tasks` in :ref:`tutorials`.   

On the *Choose a template* page select the basic *ASP.NET Core* template.  

       .. image:: images/s3-select-template.png
          :alt: Select a template

On the *Build Process* page set the Default agent queue field to *Hosted VS2017*.
          
This provides a default pipeline with the following default tasks:
    
       .. image:: images/startingbuilddefinition.png
          :alt: New build pipeline
          
          
Add the S3 Upload Task to the Pipeline
-------------------------------------- 

To capture the build output produced by the *Publish* task and upload it to Amazon S3 you need to add  
the *AWS S3 Upload* task between the existing *Publish* and *Publish Artifacts* tasks. Click the :guilabel:`Add Task` link. 
In the right hand panel, scroll through the available tasks until you see the AWS S3 Upload task. 
Click the :guilabel:`Add` button to add it to the build definition.

       .. image:: images/tasklist.png
          :alt: AWS S3 Upload Task
          
If the new task is not added immediately after the *Publish* task, drag and drop it into position.

       .. image:: images/s3taskstart.png
          :alt: AWS S3 Upload Task in Position

Click on the new task and you will see the properties for it in the right pane.

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
          
  Enter the access key and secret keys for the credentials you want to use and assign a name that 
  you will remember, then click :guilabel:`OK` to save them. The dialog will close and return to the 
  S3 Upload Task configuration with the new credentials selected.
  
* Set the region in which the bucket exists or will be created in, for example 'us-east-1', 'us-west-2' etc. 
* Enter the name of the bucket (bucket names must be globally unique).
* The :guilabel:`Source Folder` points to a folder in your build area that contains the content to be uploaded. 
  Team Services provides a number of variables, detailed here, that you can use to avoid hard-coded paths. 
  For this walk-through use the variable :guilabel:`Build.ArtifactStagingDirectory`, which is defined as 
  *the local path on the agent where artifacts are copied to before being pushed to their destination*. 
* :guilabel:`Filename Patterns` can contain one or more globbing patterns used to select files under the 
  :guilabel:`Source Folder` for upload. The default value shown here selects all files recursively. Multiple patterns 
  can be specified, one per line. For this walk-through, the preceeding task (*Publish*) emits a zip file 
  containing the build which is the file that will be uploaded.
* :guilabel:`Target Folder` is the *key prefix* in the bucket that will be applied to all of the uploaded files. 
  You can think of this as a folder path. If no value is given the files are uploaded to the root of 
  the bucket. Note that by default the relative folder hierarchy is preserved.
* There are 3 additional options that can be set:
    * Create S3 bucket if it does not exist. The task will fail if the bucket cannot be created.
    * Overwrite (in the Advanced section) - this is selected by default.
    * Flatten folders (also in Advanced section).          
    
Run the Build
-------------

With the new task configured you are ready to run the build. Click the Save and queue option.

       .. image:: images/s3taskfinal.png
          :alt: Save and Queue the Build
          
During the build you will see the task output messages to the log.

       .. image:: images/tasklog.png
          :alt: Task Log

That completes the walk-through. As you have seen using the new AWS tasks is easy to do.  Consider 
expanding the project and adding other AWS tasks.


          