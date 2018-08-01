.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _s3-upload:

##################
AWS S3 Upload Task
##################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
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

Display name*
-------------

    The default name of the task instance, which can be modified: S3 Upload

AWS Credentials
---------------

    Specifies the AWS credentials to be used by the task in the build agent environment.

    You can specify credentials using a service endpoint (of type AWS) in the task configuration or you can leave unspecified. If
    unspecified the task will attempt to obtain credentials from the following sources in order:

    * From task variables named *AWS.AccessKeyID*, *AWS.SecretAccessKey* and optionally *AWS.SessionToken*.
    * From credentials set in environment variables in the build agent process. When using environment variables in the
      build agent process you may use the standard AWS environment variables: *AWS_ACCESS_KEY_ID*, *AWS_SECRET_ACCESS_KEY* and
      optionally *AWS_SESSION_TOKEN*.
    * If the build agent is running on an Amazon EC2 instance, from the instance metadata associated with the EC2 instance. For
      credentials to be available from EC2 instance metadata the instance must have been started with an instance profile referencing
      a role granting permissions to the task to make calls to AWS on your behalf. See IAMRolesForEC2_ for more information.

AWS Region
----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

    If a region is not specified in the task configuration the task will attempt to obtain the region to be used using the standard
    AWS environment variable *AWS_REGION* in the build agent process's environment. Tasks running in build agents hosted on Amazon EC2
    instances (Windows or Linux) will also attempt to obtain the region using the instance metadata associated with the EC2 instance
    if no region is configured on the task or set in the environment variable.

    **Note:** The regions listed in the picker are those known at the time this software was released. New regions that are not listed
    may still be used by entering the *region code* of the region (for example *us_west_2*).

Bucket Name*
------------

    The name of the |S3| bucket to which the content will be uploaded. If the bucket does not exist it can be created if the *Create S3 bucket if it does not exist* option is selected.

    **Note:** bucket names must be globally unique.

Source Folder
-------------

    The source folder that the filename selection pattern(s) will be run against. If not set the root of the work area is assumed. You can also use `variables<https://go.microsoft.com/fwlink/?LinkID=550988>`_ to specify the folder.

    Example: code:`$(Build.ArtifactStagingDirectory)`

Filename Patterns
-----------------

    Glob patterns to select the file and folder content to be uploaded. Supports multiple lines of minimatch patterns.

Target Folder*
--------------

    The target folder (referred to as a key prefix in |S3|) in the bucket to contain the uploaded content. If not set the root of the bucket is assumed. You can also use `variables<https://go.microsoft.com/fwlink/?LinkID=550988>`_ to specify the folder/key prefix value.

Access Control (ACL)
-------------------

  The canned access control list (ACL) to apply to the uploaded content. See
  `Canned ACL <http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl>`_ for
  an explanation of the possible values. By default all uploaded content is marked *Private*.

Create S3 Bucket if it does not exist
-------------------------------------

  If checked and the specified bucket does not exist, the task attempts to automatically create it.


  **Note:** bucket names must be globally unique.

Server-Side Encryption
----------------------

Encryption Key Management
~~~~~~~~~~~~~~~~~~~~~~~~~

    You can optionally request |S3| to encrypt data at rest using server-side encryption. Server-side encryption is about data encryption at rest, that is, |S3| encrypts your data as it writes it to disks in its data centers and decrypts it for you when you access it.

    Select *Use AWS-managed encryption keys* if you want |S3| to manage keys used to encrypt data. To manage and provide your own keys select *Use customer-provided encryption keys*. Selecting *Not using server-side encryption* disables server-side encryption for the uploaded object(s).

Encryption Algorithm
~~~~~~~~~~~~~~~~~~~~

    Specifies a server-side encryption algorithm to use when |S3| creates an object.

KMS Master Encryption Key ID
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    The ID of the AWS Key Management Service (KMS) master encryption key to be used when encrypting the object.

    This field is required if *Encryption Algorithm* is set to *aws:kms*.

Customer Key
~~~~~~~~~~~~

    Hex-encoded string representing the encryption key for |S3| to use in encrypting data. This value is used to store the object and then is discarded; |S3| does not store the encryption key. This value must be appropriate for use with the AES256 encryption algorithm used for encryption when customer managed keys are selected.

    This field is required when *Encryption Key Management* is set to *Use customer-provided encryption key*.

Advanced
--------

Overwrite
~~~~~~~~~

  If selected existing files (|S3| objects) in the bucket at the target location are overwritten.


Flatten Folders
~~~~~~~~~~~~~~~

  If selected the relative subfolders of the files being uploaded are removed and all files are placed directly into the target location. The default behavior is to preserve the relative folder hierarchy.

Content Type
~~~~~~~~~~~~

    Sets a custom content type for the uploaded files. If a custom content type is not specified the task will apply built-in defaults for common file types (html, css, js, image files etc). This parameter can be used to override the built-in defaults.

    **Note:** any value specified is applied to **all** files processed by the task.

Storage Class
~~~~~~~~~~~~~

    Choose a storage class depending on your use case scenario and performance access requirements.

    * *STANDARD* – This storage class (the default) is ideal for performance-sensitive use cases and frequently accessed data.
    * *STANDARD_IA* – This storage class (IA, for infrequent access) is optimized for long-lived and less frequently accessed data, for example backups and older data where frequency of access has diminished, but the use case still demands high performance. **Note** There is a retrieval fee associated with STANDARD_IA objects which makes it most suitable for infrequently accessed data.
    * *REDUCED_REDUNDANCY* – The Reduced Redundancy Storage (RRS) storage class is designed for noncritical, reproducible data stored at lower levels of redundancy than the STANDARD storage class, which reduces storage costs.

    For more information see `Storage Classes<https://docs.aws.amazon.com/AmazonS3/latest/dev/storage-class-intro.html>`_ in the |S3| documentation for more information.

Force path style addressing
~~~~~~~~~~~~~~~~~~~~~~~~~~~

    If selected path style URLs will be used for S3 objects. The default is off meaning the task will automatically switch between virtual host style addressing and path style addressing depending on whether the bucket name is DNS compatible.

    For more information see `Virtual Hosting of Buckets <http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html>`_.

Task Permissions
================

This task requires permissions to call the following AWS service APIs (depending on selected task options, not all APIs may be used):

  * s3:CreateBucket
  * s3:HeadBucket

Content uploads are performed using S3's PutObject API and/or the multi-part upload APIs. The specific APIs used depend on the size of
the individual files being uploaded.
