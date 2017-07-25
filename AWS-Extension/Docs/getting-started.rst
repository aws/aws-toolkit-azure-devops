.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

##############################################################
Getting Started with AWS Tools for Visual Studio Team Services
##############################################################

This section provides information about how to install, set up, and use the AWS Tools for Team Services.

Set up a Visual Studio Team Services Account
============================================

To use `Visual Studio Team Services <https://www.visualstudio.com/team-services/>`_,
you need to sign up for
`Visual Studio Team Services <https://www.visualstudio.com/en-us/docs/setup-admin/team-services/sign-up-for-visual-studio-team-services>`_.

Install the AWS Tools for Team Services Extension
=================================================

The AWS extension for Team Services is installed from the
`Visual Studio Marketplace <https://marketplace.visualstudio.com/vsts>`_.
Sign in to your Visual Studio Team Services account, then search for *AWS Tools for Team Services*.
Choose :guilabel:`Install` to download the extension for Visual Studio Team Services, or
choose :guilabel:`Download` to download Team Foundation Server.

       .. image:: images/AWSVSTSdownload.png
          :alt: Download Team Services Extension

.. _setup-credentials:

Set up AWS Credentials for the AWS Tools for Team Services
==========================================================

To use the AWS Tools for Team Services to access AWS, you need an AWS account and AWS credentials. To increase the
security of your AWS account, we recommend that you use an *|IAM| user* to provide access credentials
instead of using your root account credentials.

.. note:: For an overview of |IAM| users and why they are important for the security of your
         account, see
         :iam-ug:`Overview of Identity Management: Users <introduction_identity-management>`
         in the |IAM-ug|.

.. topic:: To sign up for an AWS account

    #. Open http://aws.amazon.com/, and then choose :guilabel:`Sign Up`.

    #. Follow the onscreen instructions. Part of the signup procedure involves receiving a phone
       call and entering a PIN using your phone keypad.

Next, create an IAM user and download (or copy) its secret access key. To use the
AWS Tools for Team Services, you must have a set of valid AWS credentials, which consist of an access key
and a secret key. These keys are used to sign programmatic web service requests and enable AWS to
verify that the request comes from an authorized source. You can obtain a set of account credentials when
you create your account. However, we recommend that you do not use these credentials with
AWS Tools for Team Services. Instead, :iam-ug:`create one or more IAM users <Using_SettingUpUser>`,
and use those credentials.

.. topic:: To create an |IAM| user

    #.  Open the :console:`IAM console <iam>` (you may need to sign in to AWS first).

    #.  Choose :guilabel:`Users` in the sidebar to view your |IAM| users.

    #.  If you don't have any |IAM| users set up, choose :guilabel:`Create New Users` to create one.

    #.  Select the |IAM user| in the list that you want to use to access AWS.

    #.  Open the :guilabel:`Security Credentials` tab, and then choose :guilabel:`Create Access Key`.

        .. note:: You can have a maximum of two active access keys for any given |IAM| user.
                  If your |IAM| user has two access keys already, you need to delete one of them before
                  creating a new key.

    #.  In the dialog box that opens, choose :guilabel:`Download Credentials` to download the
        credential file to your computer. Or choose :guilabel:`Show User Security Credentials` to
        view the |IAM| user's access key ID and secret access key (which you can copy and paste).

        .. important:: There is no way to obtain the secret access key once you close the dialog box.
           You can, however, delete its associated access key ID and create a new one.

Create an AWS Connection
========================

To use tasks in the extension, you must link an AWS subscription to Team Foundation
Server
or to Visual Studio Team Services.
You can link your subscription from the :guilabel:`Services` tab in the Account Administration section.
Add the AWS
subscription to use in the
Build or Release Management definition by opening the Account Administration page (choose the gear icon
on
the top right of the page), and then choose :guilabel:`Services`. Choose :guilabel:`+ New Service Endpoint`.
Select the :guilabel:`AWS` endpoint type. This opens the :guilabel:`Add new AWS Connection` form.

   .. image:: images/AddNewAWSConnection.png
      :alt: Create an AWS endpoint

Provide the following parameters, and then click :guilabel:`OK`:

* Connection name
* Access key ID
* Secret access key

Use this connection name to refer to these credentials when configuring AWS tasks.

For more information, see `About Access Keys <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html?icmpid=docs_iam_console>`_.





