.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _s3-upload:

################
|S3| Upload Task
################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

Uploads file and folder content to an |S3long| (S3) bucket.

Description
===========

This task accepts a source location from which to upload files to an |S3| bucket. The target location in the bucket,
or key prefix, can also be specified. If you don't supply a target location, the files
are uploaded to the bucket root. You specify the files
to upload by using a set of one or more globbing patterns. The default pattern is :code:`**`, which
causes all files in all folders at and beneath the source location to be uploaded, preserving the relative folder paths.

The task can optionally create the bucket to which the content is to be uploaded.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.

Displayname*
------------

    The default name of the task, AWS S3 Upload. You can rename it or append the name of the
    associated S3 bucket to it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the
    |AWS-gr|.


Bucket Name*
------------

    The name of the bucket where the content will be uploaded. Bucket names must be globally unique.
    If the bucket does not exist, it will be created.

Source Folder
-------------

    The source folder that the content patterns are run against. You can browse for the folder.
    If not set, the root of the repository is assumed. Use variables if the files are not in the repo.

    Example: $(agent.builddirectory)

Filename Patterns
-----------------

    One or more globbing patterns, one per line, that are used to select the files in the
    source folder to be uploaded. Supports multiple lines of minimatch patterns.

    Default: :code:`**` to select all files and subfolders of the source location.

Target Folder*
--------------

    The target folder (also known as key prefix) in the S3 bucket that all uploaded files will share,
    or the folder path in the bucket. You can use variables.

    If not set, the root of the bucket is assumed.

Access Control
--------------

  The canned access control list (ACL) to apply to the uploaded content. See
  `Canned ACL <http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl>`_ for
  an explanation of the possible values.  The default is *Private*.

Create S3 Bucket If It Does Not Exist
-------------------------------------

  If checked and the specified bucket does not exist, the task attempts to automatically create it.

  Default: checked (auto-create).

Advanced
--------

Overwrite
~~~~~~~~~

  If checked, existing files in the bucket at the target location are overwritten.

  Default: checked (overwrite).

Flatten Folders
~~~~~~~~~~~~~~~

  If checked, the relative subfolders of the files being uploaded are removed and all files are placed
  directly into the target location.

  Default: unchecked (preserve folder hierachy).




