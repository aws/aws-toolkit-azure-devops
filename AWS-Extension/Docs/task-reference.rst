.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _task_reference:

##############
Task Reference
##############

.. meta::
   :description: Using the tasks in the AWS Tools for Team Services
   :keywords: extensions, tasks

**AWS Tools for Team Services Tasks**

The following topic list identifies the tasks included in the AWS Extensions for Team Services. 

.. _task_prerequisites:

**Prerequisites**

All the tasks require you have a AWS account. For information on setting up an account, see :ref:`setup-credentials`. 
The first required parameter for each task is AWS Credentials. If you have not yet created an AWS Connection 
click on the "+" to the right of the parameter. A  dialog appears asking you to enter your AWS access 
key and secret key credentials, and to give the credentials a name. We suggest not using your root 
credentials but using the credentials associated with an IAM user account. The secret key text is 
automatically masked. Click :guilabel:`OK` to save the credentials into your Team Services account 
and return to the configuration of the new task. The name for the new credentials has been entered 
into the AWS Credentials field. Once created, those credentials are available in the pulldown list for 
that parameter whenever you set up a task.

       .. image:: images/AddNewAWSConnection.png
          :alt: Add an AWS connection
          

.. toctree::
   :maxdepth: 1
   :titlesonly:

   aws-cli   
   cloudformation-create-update
   cloudformation-delete-changeset
   cloudformation-delete-stack
   cloudformation-execute-changeset
   codedeploy-deployment
   elastic-beanstalk-deploy
   lambda-deploy
   lambda-invoke
   s3-download
   s3-upload



