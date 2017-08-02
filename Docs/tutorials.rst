.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _tutorials:
   
#############################################################
Using the AWS Tools for Microsoft Visual Studio Team Services
#############################################################

.. meta::
   :description: Programming information for the AWS Tools for Microsoft Visual Studio Team Servicesa
   :keywords:  AWS, S3, Visual Studio Team Services Marketplace

The following tutorials demonstrate how to create and run Visual Studio Team Services (VSTS) projects which use the AWS tasks.

**Prerequisites**

* Either a VSTS account or Team Foundation Services locally installed.
* An AWS account and preferably an associated IAM user account.
* Task specific permissions.

See :ref:`getting-started` for instructions to install the AWS Tools for VSTS and set up your credentials.

**Create a Project To Use AWS Tasks**

Navigate to your Projects home page and click on :guilabel:`New Project`.

       .. image:: images/new-project.png
          :alt: AWS Credential Field

Fill in the Create new project dialog and click :guilabel:`Create`.
          
       .. image:: images/create-new-project-2.png
          :alt: AWS Credential Field
          
On the Get started page click on *or initialize with a README or gitignore*.  The :guilabel:`Add a README` 
box appears as checked. Click :guilabel:`Initialize`.

       .. image:: images/create-new-project-4.png
          :alt: AWS Credential Field
 
The *Set up Build* page is displayed. Click on :guilabel:`Set up Build`.

       .. image:: images/create-new-project-setup-build.png
          :alt: AWS Credential Field
 
The *Choose a template* page is displayed. At this point you will select the template called for by the 
tutorial.

       .. image:: images/create-new-project-select-template.png
          :alt: AWS Credential Field
           
In the tutorial you will be walked through setting up the build process for that tutorial. When you add 
the AWS task for that tutorial to the build process you will need to fill in it's property sheet. A property 
common to all the AWS tasks worthy of explanation is *Task Credentials*.

**Configure the Task Credentials**

Tasks that make requests against AWS services need to have credentials configured. In 
Team Systems terminology these are known as Service Endpoints. The AWS tasks provide a Service Endpoint 
type called AWS to enable you to provide credentials. To quickly add credentials for this task, click 
the :guilabel:`+` link to the right of the AWS Credentials field.

       .. image:: images/credentialsfield.png
          :alt: AWS Credential Field
          
Clicking the the gear link opens a new browser tab to a page where you can manage all your service 
endpoints (including the new AWS type). You might add multiple service endpoints if you want to set 
up multiple sets of AWS credentials for your tasks to use.

Having clicked the :guilabel:`+` link a dialog window appears in which you can enter your AWS keys:

       .. image:: images/credentialdialog.png
          :alt: AWS Credential Dialog
          
If you have used any of the AWS SDKs or tools such as the AWS CLI or AWS Tools for Windows PowerShell 
the options here might look familiar. Just as in those SDKs and tools you are constructing 
an AWS credential profile. Profiles have names, in this case  the value entered for :guilabel:`Connection name`, 
that will be used to refer to this set of credentials in the task configuration. Enter the access key 
and secret keys for the credentials you want to use and assign a name that you will remember, then 
click :guilabel:`OK` to save them. The dialog will close and return to the task configuration with the 
new credentials selected.

The credentials you entered can be reused in other tasks, simply select the name you used to identify 
the credentials in the AWS Credentials drop-down for the task you are configuring.

.. note::

        We recommend that you do not use your account's root credentials. Instead, create one or more 
        IAM users, and then use those credentials. For more information, see 
        `Best Practices for Managing AWS Access Keys <https://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html>`_.


.. toctree::
   :maxdepth: 1
   :titlesonly:

   tutorial-eb
   tutorial-s3

          