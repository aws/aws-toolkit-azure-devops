.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _aws-cli:

#######
AWS CLI
#######

.. meta::
   :description: Using the tasks in the AWS Extensions to  Visual Studio Team System
   :keywords: extensions, tasks

Run a Shell or Batch Script with AWS Commands Against an AWS Connection.
========================================================================

#.  Click the :guilabel:`Add` Task button in the pipeline to browse to and select the :samp:`AWS CLI` 
    task from the AWS Tools extension you installed. Click :guilabel:`Add`.

       .. image:: images/AWSCLIList.png
          :alt: Select AWS CLI task
          
#.  The task will appear in the Build Process list with the message Some settings need attention. 

       .. image:: images/AWSCLITask.png
          :alt: Select AWS CLI task      
          
#.  Select the task and the task parameters window will be displayed in the right pane.
          
       .. image:: images/AWSCLIScreen.png
          :alt: Select AWS CLI task      
          
#.  The first required parameter is labelled *AWS Credentials*. If you have not already set up your 
    credentials, see :ref:`task_reference`.

    Enter the rest of the required parameters for the task. The task needs the region in which to call 
    the AWS CLI and the command to execute.  The other fields are optional, for an explanation of each field 
    click on the information icon following the name of the field.
    
    