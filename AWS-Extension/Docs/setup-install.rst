.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

###########################################
Set up the |sdk-java| 2.0 Developer Preview
###########################################

This topic describes how to set up and use the |sdk-java| in your project.

Prerequisites
=============

To use the |sdk-java|, you must have:

* A suitable :ref:`Java Development Environment <java-dg-java-env>`.

* An AWS account and access keys. For instructions, see :doc:`signup-create-iam-user`.

* AWS credentials (access keys) set in your environment, or use the shared credentials file used by
  the AWS CLI and other SDKs. For more information, see :doc:`setup-credentials`.


.. _include-sdk:

Including the SDK in Your Project
=================================

Depending on your build system or IDE, use one of the following methods:

* **Apache Maven** |ndash| If you use |mvnlong|_, you can specify only the SDK components
  you need or the entire SDK (not recommended) as dependencies in your project.
  See :doc:`setup-project-maven`.

* **Gradle** |ndash| If you use Gradle_, you can import the Maven Bill of Materials (BOM) to your
  Gradle project to automatically manage SDK dependencies. See :doc:`setup-project-gradle`.

.. note:: Any build system that supports MavenCentral as an artifact source may be used. However we
   will not provide a downloadable zip for the developer preview.

.. _install-prev-sdk:

Compiling the SDK
=================

You can build the |sdk-java| using Maven. Maven downloads all necessary dependencies, builds the SDK,
and installs the SDK in one step. See http://maven.apache.org/ for installation instructions and more information.

.. topic:: To compile the SDK

    #. Open |sdk-java-github|_.

       .. note:: Version 1.0 of the SDK is also available in GitHub at |sdk-java-github-v1|_.

    #. Click the :guilabel:`Clone or download` button to choose your download option.

    #. In a terminal window, navigate to the directory where you downloaded the SDK source.

    #. Build and install the SDK by using the following command (Maven_ required).

       ::

        mvn clean install

       The resulting :file:`.jar` file is built into the :file:`target` directory.

    #. (Optional) Build the API Reference documentation using the following command.

       ::

        mvn javadoc:javadoc

       The documentation is built into the :file:`target/site/apidocs/` directories of each service.


.. _java-dg-java-env:

Installing a Java Development Environment
=========================================

The |sdk-java| requires Java SE Development Kit *8.0 or later*. You can download the latest Java
software from http://www.oracle.com/technetwork/java/javase/downloads/.

Choosing a JVM
==============

For the best performance of your server-based applications with the |sdk-java|, we recommend
that you use the *64-bit version* of the Java Virtual Machine (JVM). This JVM runs only in server
mode, even if you specify the ``-Client`` option at run time.
