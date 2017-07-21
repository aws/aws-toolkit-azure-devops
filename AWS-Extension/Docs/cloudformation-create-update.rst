.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _cloudformation-create-update:

#####################################
AWS CloudFormation Create-Update Task
#####################################

.. meta::
   :description: Using the tasks in the AWS tools fot Team System
   :keywords: extensions, tasks

Creates a new AWS CloudFormation stack or updates the Stack if it exists.


#.  Click the :guilabel:`Add` Task button in the pipeline to browse to and select the :samp:`AWS CloudFormation Create-Update` 
    task from the AWS Tools extension you installed. Click :guilabel:`Add`.

       .. image:: images/AwsCloudFormationCreateUpdateList.png
          :alt: Select Aws CloudFormation Create-Update
          
#.  The task will appear in the Build Process list with the message :guilabel:`Some settings need attention`. 

       .. image:: images/AwsCloudFormationCreateUpdateTask.png
          :alt: Select Aws CloudFormation Create-Update      
          
#.  Select the task and the task parameters window will be displayed in the right pane.
          
       .. image:: images/AwsCloudFormationCreateUpdateScreen.png
          :alt: Aws CloudFormation Create-Update paramters      

#.  Enter the required parameters.

        * The first required parameter is labelled *AWS Credentials*. If you have not already set up your 
          credentials, see :ref:`task_reference`.   
        * The AWS region.
        * The name associated with the stack. The name must be unique in the region it is created in.
        
#.  Enter optional parameters, for an explanation of each field click on the information icon following the name of the field.               

    

