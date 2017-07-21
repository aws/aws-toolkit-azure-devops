.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

##############################################################
Getting Started with AWS Tools for Team Services
##############################################################

This section provides information about how to install, set up, and use the AWS Tools for Team Services.

Set up a Visual Studio Team Services Account
============================================

To use `Visual Studio Team Services <https://www.visualstudio.com/team-services/>`_ 
you will need you will to 
`sign up for Visual Studio Team Services <https://www.visualstudio.com/en-us/docs/setup-admin/team-services/sign-up-for-visual-studio-team-services>`_. 

Install the AWS Tools for Team Services Extension
=================================================

The AWS Tools for Team Services extension is installed from the 
`Visual Studio Marketplace <https://marketplace.visualstudio.com/vsts>`_. 
Sign in to your Visual Studio Team Services (VSTS) account, the search for :code:`AWS Tools for Team Services`. 
Click :guilabel:`Install` to download the extension for Visual Studio team Services or click :guilabel:`Download` 
to download for Team Foundation Server.

       .. image:: images/AWSVSTSdownload.png
          :alt: Download VSTS Extension

.. _setup-credentials:
          
Set up AWS Credentials for the AWS Tools for Team Services
==========================================================

To use the AWS Tools for Team Services to access AWS, you need an AWS account and AWS credentials. To increase the
security of your AWS account, we recommend that you use an *IAM user* to provide access credentials
instead of using your root account credentials.

.. tip:: For an overview of IAM users and why they are important for the security of your account,
         see :iam-ug:`Overview of Identity Management: Users <introduction_identity-management>`
         in the |IAM-ug|.

To Sign Up for an AWS Account
-----------------------------

    #. Open http://aws.amazon.com/ and click :guilabel:`Sign Up`.

    #. Follow the on-screen instructions. Part of the sign-up procedure involves receiving a phone
       call and entering a PIN using your phone keypad.

Next, create an IAM user and download (or copy) its secret access key. To use the 
AWS Tools for Team Services, you must have a set of valid AWS credentials, which consist of an access key
and a secret key. These keys are used to sign programmatic web service requests and enable AWS to
verify that the request comes from an authorized source. You can obtain a set of account credentials when
you create your account. However, we recommend that you do not use these credentials with 
AWS Tools for Team Services. Instead, :iam-ug:`create one or more IAM users <Using_SettingUpUser>`, 
and use those credentials. For applications that run on |EC2| instances, you can use 
:iam-ug:`IAM roles <WorkingWithRoles>` to provide temporary credentials.

To Create an IAM User
---------------------

    #.  Go to the :console:`IAM console <iam>` (you may need to sign in to AWS first).

    #.  Click :guilabel:`Users` in the sidebar to view your IAM users.

    #.  If you don't have any IAM users set up, click :guilabel:`Create New Users` to create one.

    #.  Select the IAM user in the list that you'll use to access AWS.

    #.  Open the :guilabel:`Security Credentials` tab, and click :guilabel:`Create Access Key`.

        .. note:: You can have a maximum of two active access keys for any given IAM user. If your
           IAM user has two access keys already, then you'll need to delete one of them before
           creating a new key.

    #.  In the resulting dialog box, choose :guilabel:`Download Credentials` to download the
        credential file to your computer, or click :guilabel:`Show User Security Credentials` to
        view the IAM user's access key ID and secret access key (which you can copy and paste).

        .. important:: There is no way to obtain the secret access key once you close the dialog.
           You can, however, delete its associated access key ID and create a new one.

Create an AWS Connection
========================

To deploy to AWS, an AWS subscription has to be linked to Team Foundation Server or to Visual Studio Team Services 
using the Services tab in the Account Administration section. Add the AWS subscription to use in the 
Build or Release Management definition by opening the Account Administration screen (gear icon on the 
top-right of the screen) and then click on the Services Tab. Click on :guilabel:`+ New Service Endpoint`. 
Select the :guilabel:`AWS` endpoint type. That brings up the *Add new AWS Connection* form.

   .. image:: images/AddNewAWSConnection.png
      :alt: Create an AWS Endpoint
      
Provide the following parameters and click :guilabel:`OK`.

* Connection name
* Access Key ID
* Secret Access Key

For more information, see `About Access Keys <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html?icmpid=docs_iam_console>`_. 



   

