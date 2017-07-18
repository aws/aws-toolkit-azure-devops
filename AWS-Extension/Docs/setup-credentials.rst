.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

#################################################
Set up AWS Credentials and Region for Development
#################################################

.. meta::
   :description: Set up default AWS credentials and region for development with the AWS SDK for
                 Java.
   :keywords: AWS region, AWS credentials, shared credentials file, shared config file

To connect to any of the supported services with the |sdk-java|, you must provide AWS credentials.
The AWS SDKs and CLIs use :emphasis:`provider chains` to look for AWS credentials in several
different places, including system/user environment variables and local AWS configuration files.

This topic provides basic information about setting up your AWS credentials for local application
development using the |sdk-java|. If you need to set up credentials for use within an |EC2| instance
or if you're using the Eclipse IDE for development, see the following topics instead:

* When using an EC2 instance, create an IAM role and then give your EC2 instance access to that role
  as shown in :doc:`java-dg-roles`.

* Set up AWS credentials within Eclipse using the |tke|_. See :tke-ug:`Set up AWS Credentials
  <setup-credentials>` in the |tke-ug|_.

.. _setup-credentials-setting:

Setting AWS Credentials
=======================

You can set your credentials for use by the |sdk-java| in several ways. However, these are
the recommended approaches:

.. The following file is in the shared content at https://github.com/awsdocs/aws-doc-shared-content

.. include:: common/sdk-shared-credentials.txt

Once you set your AWS credentials using one of these methods, the |sdk-java| loads them automatically
by using the default credential provider chain. For more information about
working with AWS credentials in your Java applications, see :doc:`credentials`.

.. _setup-credentials-setting-region:

Setting the AWS Region
======================

You should set a default AWS Region to use for accessing AWS services with the |sdk-java|. For the best
network performance, choose a region that's geographically close
to you (or to your customers).

.. note:: If you *don't* select a region, service calls that require a region will fail.

You can use techniques similar to those for setting credentials to set your default AWS Region:

.. The following file is in the shared content at https://github.com/awsdocs/aws-doc-shared-content

.. include:: common/sdk-shared-region.txt

For information about selecting a region, see :doc:`java-dg-region-selection`.
