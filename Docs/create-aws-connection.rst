.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

########################
Create an AWS Connection
########################

.. meta::
   :description: Create an AWS connection for AWS Tools for Team Services Extension
   :keywords: AWS, VSTS, Visual Studio Team Sevices Extension

To deploy to AWS, an AWS subscription has to be linked to Team Foundation Server or to Visual Studio Team Services 
using the Services tab in the Account Administration section. Add the AWS subscription to use in the 
Build or Release Management definition by opening the Account Administration screen (gear icon on the 
top-right of the screen) and then click on the Services Tab. Click on :guilabel:`+ New Service Endpoint`.

   .. image:: images/CreateEndPoint.png
      :alt: Create an AWS Endpoint
      
Select the :guilabel:`AWS` endpoint type, and provide the following parameters:

* Access Key ID
* Secret Access Key
* AWS region name

For more information, see `About Access Keys <https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html?icmpid=docs_iam_console>`_. 

