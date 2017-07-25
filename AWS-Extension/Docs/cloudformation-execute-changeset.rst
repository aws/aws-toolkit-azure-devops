.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _cloudformation-execute-changeset:

#####################################
AWS CloudFormation Execute Change Set
#####################################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks
   
Execute an AWS CloudFormation change set to create or update a stack.


#.  Click the :guilabel:`Add` Task button in the pipeline to browse to and select the :samp:`AWS CloudFormation Execute Change Set` 
    task from the AWS Tools extension you installed. Click :guilabel:`Add`.

       .. image:: images/AwsCloudFormationExecuteChangeSetList.png
          :alt: Select Aws CloudFormation Execute Change Set
          
#.  The task will appear in the Build Process list with the message :guilabel:`Some settings need attention`. 

       .. image:: images/AwsCloudFormationExecuteChangeSetTask.png
          :alt: Aws CloudFormation Execute Change Set Task      
          
#.  Select the task and the task parameters window will be displayed in the right pane.
          
       .. image:: images/AwsCloudFormationExecuteChangeSetScreen.png
          :alt: Aws CloudFormation Execute Change Set parameters      
          
#.  Enter the required parameters.

        * The first required parameter is labelled *AWS Credentials*. If you have not already set up your 
          credentials, see :ref:`task_reference`.   
        * The AWS region.
        * The name or Amazon Resource Name (ARN) of the change set you want to execute.
        
#.  Enter optional parameters, for an explanation of each field click on the information icon following the name of the field.

