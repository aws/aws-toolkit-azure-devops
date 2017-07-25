.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _codedeploy-deployment:

#########################
AWS CodeDeploy Deployment
#########################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Deploy an application to Amazon EC2 instance(s) using AWS CodeDeploy.

#.  Click the :guilabel:`Add` Task button in the pipeline to browse to and select the :samp:`AWS CloudFormation Delete Change Set` 
    task from the AWS Tools extension you installed. Click :guilabel:`Add`.

       .. image:: images/AwsCodeDeployAppDeployList.png
          :alt: Select Aws CloudFormation Delete Change Set
          
#.  The task will appear in the Build Process list with the message :guilabel:`Some settings need attention`. 

       .. image:: images/AwsCodeDeployAppDeployTask.png
          :alt: Aws CloudFormation Delete Change Set Task      
          
#.  Select the task and the task parameters window will be displayed in the right pane.
          
       .. image:: images/AwsCodeDeployAppDeployScreen.png
          :alt: Aws CloudFormation Delete Change Set parameters      
          
#.  Enter the required parameters.

        * The first required parameter is labelled *AWS Credentials*. If you have not already set up your 
          credentials, see :ref:`task_reference`.   
        * The AWS region.
        * The name of the AWS CodeDeploy application.
        * The name of the deployment group the revision will be deployed to.
        * The location of the archive bundle containing the application revision artifacts to be deployed, 
          including the :code:`appspec.yml` file. The task will upload this archive to S3 before requesting 
          the deployment.
        * The name of the bucket to which the revision bundle will be uploaded.
        
#.  Enter optional parameters, for an explanation of each field click on the information icon following the name of the field.

