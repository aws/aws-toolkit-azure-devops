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
--------

Uploads file and folder content to an Amazon Simple Storage Service (S3) bucket.

Details
-------

This task accepts a source location from which to upload files to an Amazon S3 bucket. The target location in the bucket,
or key prefix, can also be specified. If a target location is not supplied the files are uploaded to the bucket root. The files
to be uploaded are specified using a set of one or more globbing patterns. The default pattern is ** which will cause all files
in all folders at and beneath the source location to be uploaded, preserving the relative folder paths.

The task can optionally create the bucket to which the content is to be uploaded.

Parameters
----------

:Display name:
  A string to identify the task in the build process.
:Required: Yes
:Default Value: The name of the task suffixed with the bucket name.

:AWS Credentials:
  The name of the AWS service endpoint that will be used to supply credentials to the task to enable it to call AWS services. If you have
  not already set up your credentials, see :ref:`task_reference`.
:Required:  Yes
:Default Value:  None

:AWS Region:
  The name of the region in which the bucket exists, or will be created. For example 'us-east-1', 'us-west-2' etc.
:Required: Yes
:Default Value:  None

:Bucket Name:
  The name of the bucket to which the files will be uploaded. Bucket names must be globally unique.
:Required: Yes
:Default Value:  None

:Source Folder:
  The folder location at which the globbing patterns to select files to upload will be run.
:Required: No
:Default Value:  None. If not specified the root of the working folders for the build process will be used.

:Filename Patterns:
  One or more globbing patterns, one per line, that will be used to select the files beneath the source folder to be uploaded.
:Required: Yes
:Default Value: **, to select all files and subfolders of the source location.

:Target Folder:
  The S3 key prefix that all uploaded files will share. You can think of this as specifying the folder path in the bucket.
:Required: No
:Default Value: None. If not specified the files will be uploaded to the root of the bucket.

:Access Control:
  Sets an access control list (ACL) on the uploaded files.
:Required: No
:Default Value: Private

:Create S3 Bucket if it does not exist:
  If checked and the specified bucket does not exist the task will attempt to automatically create it.
:Required: No
:Default Value: Auto-create (checked)

:Overwrite:
  If checked existing files in the bucket at the target location will be overwritten.
:Required: No
:Default Value: Overwrite (checked)

:Flatten Folders:
  If checked the relative subfolders of the files being uploaded will be removed causing all files to be placed directly into the
  target location.
:Required: No
:Default Value: Preserve folder hierarchy (unchecked)


  .. image:: images/AwsS3UploadScreen.png
    :alt: Aws S3 Upload parameters

