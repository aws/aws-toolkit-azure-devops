.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _s3-download:

###############
AWS S3 Download
###############

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

Download file and folder content from an |S3long| (S3) bucket.

Description
===========

This task accepts a target folder location to which to download files from an |S3| bucket. The source 
location in the bucket, or key prefix, can also be specified. If a source location is not supplied 
the bucket root is used. The files to be downloaded are specified using a set of one or more globbing 
patterns. The default pattern is ** which will cause all files in all folders at and beneath the source 
ocation to be downloaded, preserving the relative folder paths.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.

Displayname*
------------
    
    By default the name of the task, AWS S3 Download. You can rename it or append the name of the 
    associated S3 bucket to it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on :guilabel:`+`, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|.

Bucket Name*
------------

    The name of the bucket containing the content to be download.

Source Folder
-------------

    The source folder (key prefix) in the bucket that the content pattern(s) will be run against. 
    If not set the root of the bucket is assumed.

Filename Patterns
-----------------

    Glob patterns to select the file and folder content to be downloaded. Supports multiple lines of 
    minimatch patterns. The default is :code:`**`.


Target Folder*
--------------

    The target folder to contain the downloaded content. You can browse for it or can use 
    `variables <https://www.visualstudio.com/en-us/docs/build/define/variables>`_.

Advanced	
--------
	
Overwrite
~~~~~~~~~

    If checked replace existing files in and beneath the target folder. If not checked and the file 
    already exists in the target location an error is thrown. The default is checked (overwrite).
    
    
    
	