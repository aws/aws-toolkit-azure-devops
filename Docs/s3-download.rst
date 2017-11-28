.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _s3-download:

####################
AWS S3 Download Task
####################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Downloads file and folder content from an |S3long| (S3) bucket.

Description
===========

Downloads file and folder content from an |S3long| (S3) bucket to a folder location.
The source location in the bucket, or key prefix, can also be specified. If a source location 
is not supplied,the bucket root is used. You specify the files to download using a set of one 
or more globbing patterns. The default pattern is :code:`**`, causing all files in all 
folders at and beneath the source location to be downloaded, preserving the relative folder paths.

Parameters
==========

You can set the following parameters for the task. Required parameters are noted by an 
asterisk (*). Other parameters are optional.

Displayname*
------------

    The default name of the task, AWS S3 Download. You can rename it or append the name of the
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

    The name of the bucket containing the content to download.

Source Folder
-------------

    The source folder (key prefix) in the bucket that the content patterns are run against.
    If not set, the root of the bucket is assumed.

Filename Patterns
-----------------

    Glob patterns to select the file and folder content to download. Supports multiple lines of
    minimatch patterns. The default is :code:`**`.


Target Folder*
--------------

    The target folder to contain the downloaded content. You can browse for it or you can use
    `variables <https://www.visualstudio.com/en-us/docs/build/define/variables>`_.

Advanced
--------

Overwrite
~~~~~~~~~

    If checked, replaces existing files in and beneath the target folder. If not checked and the file
    already exists in the target location, an error is thrown.

    Default: checked (overwrite).

Force path style addressing
~~~~~~~~~~~~~~~~~~~~~~~~~~~

    If checked the task will always use path style addressing to work with the bucket. The default
    behavior, when unchecked, is to use virtual host style addressing if the bucket name is DNS
    compatible and path style otherwise. For more information see 
    `Virtual Hosting of Buckets <http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html>`_.

Flatten folders
~~~~~~~~~~~~~~~

    If checked the task will remove the key prefix from the downloaded objects causing them to be
    written to the selected download folder. If this option is unchecked, the key prefix of each
    object is preserved and objects are downloaded to a subfolder hierarchy matching the key prefix
    of the object.
