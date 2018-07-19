.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _s3-download:
.. _IAMRolesForEC2: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html

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

Display name*
-------------

    The default name of the task instance, which can be modified: S3 Download

AWS Credentials
---------------

    Specifies the AWS credentials to be used by the task in the build agent environment.

    You can specify credentials using a service endpoint (of type AWS) in the task configuration or you can leave unspecified. If
    unspecified the task will attempt to use credentials set in environment variables in the build agent process or, if the build agent
    is running on an Amazon EC2 instance, the task can obtain and use credentials from the instance metadata associated with the EC2
    instance. For credentials to be available from EC2 instance metadata the instance must have been started with an instance profile
    referencing a role granting permissions to the task to make calls to AWS on your behalf. See
    IAMRolesForEC2_ for more information.

    When using environment variables in the build agent process you may use the standard AWS environment variables - *AWS_ACCESS_KEY_ID*,
    *AWS_SECRET_ACCESS_KEY* and optionally *AWS_SESSION_TOKEN*.

AWS Region
----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

    If a region is not specified in the task configuration the task will attempt to obtain the region to be used using the standard
    AWS environment variable *AWS_REGION* in the build agent process's environment. Tasks running in build agents hosted on Amazon EC2
    instances (Windows or Linux) will also attempt to obtain the region using the instance metadata associated with the EC2 instance
    if no region is configured on the task or set in the environment variable.

Bucket Name*
------------

    The name of the |S3| bucket containing the content to download.

Source Folder
-------------

    The source folder (or S3 key prefix) in the bucket that the filename selection pattern(s) will be run against to select objects to download. If not set the root of the bucket is assumed.

Filename Patterns
-----------------

    Glob patterns to select the file and folder content to download. Supports multiple lines of
    minimatch patterns. The default is :code:`**`.


Target Folder*
--------------

    The target folder on the build host to contain the downloaded content. You can browse for it or you can use
    `variables <https://www.visualstudio.com/en-us/docs/build/define/variables>`_.

Server-Side Encryption
----------------------

Encryption Key Management
~~~~~~~~~~~~~~~~~~~~~~~~~

    When you retrieve an object from |S3| that was encrypted by using server-side encryption with customer-provided encryption keys (SSE-C), set *Use customer-provided encryption key* and provide the customer key data to enable the object(s) to be decrypted. If the object(s) were encrypted using an |S3|-provided key leave this option set to the default value, *Not using server-side encryption, or encrypted using an Amazon S3 managed key*.

Customer Key
~~~~~~~~~~~~

    Available, and required, when *Encryption Key Management* is set to *Use customer-provided encryption key*. Hex-encoded string representing the encryption key for |S3| to use in decrypting data. This value is used to decrypt the object and then is discarded; Amazon does not store the encryption key. This value must be appropriate for use with the AES256 encryption algorithm used for encryption when customer managed keys are selected.

Advanced
--------

Overwrite
~~~~~~~~~

    If selected the download replaces existing files in and beneath the target folder. If not selected and the file already exists in the target location, an error is thrown.

Force path style addressing
~~~~~~~~~~~~~~~~~~~~~~~~~~~

    If selected path style URLs will be used when working with the bucket. The default is off meaning the task will automatically switch between virtual host style addressing and path style addressing depending on whether the bucket name is DNS compatible.

    For more information see `Virtual Hosting of Buckets <http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html>`_.

Flatten folders
~~~~~~~~~~~~~~~

    If selected the task will remove the key prefix from the downloaded objects causing them to be written to the selected download folder without subpaths.

    If this option is unchecked, the key prefix of each object is preserved and objects are downloaded to a subfolder hierarchy matching the key prefix of the object.

    **Note:** if folder flattening is selected and multiple objects, with the same name but different key prefixes, exist in the download set an error will be thrown by the task if the *Overwrite* option is not selected.
