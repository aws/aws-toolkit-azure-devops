.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _s3-upload:

#############
AWS S3 Upload
#############

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

Uploads file and folder content to an |S3long| (S3) bucket.

Description
===========

This task accepts a source location from which to upload files to an |S3long| bucket. The target location in the bucket,
or key prefix, can also be specified. If a target location is not supplied the files are uploaded to the bucket root. The files
to be uploaded are specified using a set of one or more globbing patterns. The default pattern is :code:`**` which will cause all files
in all folders at and beneath the source location to be uploaded, preserving the relative folder paths.

The task can optionally create the bucket to which the content is to be uploaded.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters 
are noted by an '*', the others are optional.

Displayname*
------------
    
    By default the name of the task, AWS S3 Upload. You can rename it or append the name of the 
    associated S3 bucket to it.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on +, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|. 

Bucket Name*
------------

    The name of the bucket where the content will be uploaded. Bucket names must be globally unique. 
    If the bucket does not exist it will be created.

Source Folder
-------------

    The source folder that the content pattern(s) will be run against. You can browse for the folder. 
    If not set the root of the repo is assumed. Use variables if the files are not in the repo. 
    Example: $(agent.builddirectory)

Filename Patterns
-----------------

    One or more globbing patterns, one per line, that will be used to select the files in the 
    source folder to be uploaded. Supports multiple lines of minimatch patterns. The default is :code:`**`, 
    to select all files and subfolders of the source location.

Target Folder*
--------------
    
    The target folder (also known as key prefix) in the S3 bucket that all uploaded files will share, 
    or the folder path in the bucket. You can use variables.
    
    If not set the root of the bucket is assumed. 

Access Control
--------------

  The canned Access Control List (ACL) to apply to the uploaded content. See 
  `Canned ACL <http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl>`_ for 
  an explanation of the possible values.  The default is *Private*.

Create S3 Bucket if it does not exist
-------------------------------------

  If checked and the specified bucket does not exist the task will attempt to automatically create it. 
  The default is checked (auto-create).

Advanced
--------
  
Overwrite
~~~~~~~~~

  If checked existing files in the bucket at the target location will be overwritten. The default is 
  checked (overwrite).

Flatten Folders
~~~~~~~~~~~~~~~

  If checked the relative subfolders of the files being uploaded are removed and all files are placed 
  directly into the target location.  The default is unchecked (preserve folder hierachy)
 
    
    
	
