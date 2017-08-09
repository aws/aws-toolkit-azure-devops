.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _tutorials:
   
############################
Using the AWS Tools for VSTS
############################

.. meta::
   :description: Programming information for the AWS Tools for Microsoft Visual Studio Team Services
   :keywords:  AWS, S3, Visual Studio Team Services Marketplace

The following tutorials demonstrate how to create and run AWS Tools for Microsoft Visual Studio Team 
Services projects which use the AWS tasks.

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
           

.. toctree::
   :maxdepth: 1
   :titlesonly:

   tutorial-eb
   tutorial-s3

          