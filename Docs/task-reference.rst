.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

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
   :description: Using the tasks in the AWS Tools for VSTS
   :keywords: extensions, tasks

This reference describes the tasks that are included in the AWS Tools for Microsoft
Visual Studio Team Services.

.. _task_prerequisites:

**Prerequisites**

You must have an AWS account. For information on setting up an account, see AWSSignUp_.

Each task requires AWS credentials for your account be available to the build agent running your task, and the region 
in which the API calls to AWS services should be made.

  You can either:

  * Specify credentials explicitly for each task, by configuring a named service endpoint (of endpoint type *AWS*) and
    then referring to the endpoint name in the *AWS Credentials* field for each task. Region can be set in the *AWS Region* property
    for a task.

      .. image:: images/AddNewAWSConnection.png
      :alt: Add an AWS connection

  * Supply credentials and region to tasks using environment variables in the process hosting the build agent.

  * If your build agent is running on an Amazon EC2 instance you can also elect to have credentials (and region) be obtained automatically
    from the instance metadata associated with the instance. For credentials to be available from EC2 instance metadata the instance must
    have been started with an instance profile referencing a role granting permissions to the task to make calls to AWS on your behalf. See
    `Using an IAM Role to Grant Permissions to Applications Running on Amazon EC2 Instances<https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html>`_
    for more information

**Note:** If you choose to use an AWS Service Endpoint to supply credentials to tasks we strongly recommend using an |IAMLong|
user account, with appropriate permissions to scope the privileges of the user account to only those needed to execute the task(s) you need.

.. toctree::
   :maxdepth: 1
   :titlesonly:

   aws-cli
   awspowershell-module-script
   awsshell
   cloudformation-create-update
   cloudformation-delete-stack
   cloudformation-execute-changeset
   codedeploy-deployment
   ecr-pushimage
   elastic-beanstalk-createversion
   elastic-beanstalk-deploy
   lambda-deploy
   lambda-invoke
   lambda-netcore-deploy
   s3-download
   s3-upload
   secretsmanager-create-update
   secretsmanager-getsecret
   send-message
   systemsmanager-getparameter
   systemsmanager-setparameter
   systemsmanager-runcommand

