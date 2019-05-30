# Overview

Build: ![TravisCI Build Status - master branch](https://travis-ci.org/aws/aws-vsts-tools.svg?branch=master)
Coverage: [![codecov](https://codecov.io/gh/aws/aws-vsts-tools/branch/master/graph/badge.svg)](https://codecov.io/gh/aws/aws-vsts-tools)

AWS Tools for Microsoft Visual Studio Team Services (VSTS) adds tasks to easily enable build and release pipelines in VSTS and Team Foundation Server to work with AWS services including Amazon S3, AWS Elastic Beanstalk, AWS CodeDeploy, AWS Lambda, AWS CloudFormation, Amazon Simple Queue Service and Amazon Simple Notification Service, and run commands using the AWS Tools for Windows PowerShell module and the AWS CLI.

AWS Tools for VSTS is available from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-vsts-tools).

This is an open source project because we want you to be involved. We love issues, feature requests, code reviews, pull
requests or any positive contribution. Please see the the [CONTRIBUTING](CONTRIBUTING.md) guide for how to help, including how to build your own extension.

## Highlighted list of supported services

-   AWSCLI - Interact with the AWSCLI (Windows hosts only for now)
-   AWS Powershell Module - Interact with AWS through powershell (Windows hosts only)
-   Beanstalk - Deploy ElasticBeanstalk applications
-   CodeDeploy - Deploy with CodeDeploy
-   CloudFormation - Create/Delete/Update CloudFormation stacks
-   ECR - Push an image to an ECR repository
-   Lambda - Deploy from S3, .net core applications, or any other language that builds on VSTS
-   S3 - Upload/Download to/from S3 buckets
-   Secrets Manager - Create and retrieve secrets
-   SQS - Send SQS messages
-   SNS - Send SNS messages
-   Systems manager - Get/set parameters and run commands

## User Guide

The [User Guide](https://docs.aws.amazon.com/vsts/latest/userguide/welcome.html) contains additional instructions for getting up and running with the extension.

## Credentials Handling for AWS Services

To enable tasks to call AWS services when run as part of your build or release pipelines AWS credentials need to have been configured for the tasks or be available in the host process for the build agent. Note that the credentials are used specifically by the tasks when run in a build agent process, they are not related to end-user logins to your VSTS or TFS instance.

The AWS tasks support the following mechanisms for obtaining AWS credentials:

-   One or more service endpoints, of type _AWS_, can be created and populated with AWS access and secret keys, and optionally data for _Assumed Role_ credentials.
    -   Tasks reference the configured service endpoint instances by name as part of their configuration and pull the required credentials from the endpoint when run.
-   Variables defined on the task or build.
    -   If tasks are not configured with the name of a service endpoint they will attempt to obtain credentials, and optionally region, from variables defined in the build environment. The
        variables are named _AWS.AccessKeyID_, _AWS.SecretAccessKey_ and optionally _AWS.SessionToken_. To supply the ID of the region to make the call in, e.g. us-west-2, you can also use the variable _AWS.Region_.
-   Environment variables in the build agent's environment.
    -   If tasks are not configured with the name of a service endpoint, and credentials or region are not available from task variables, the tasks will attempt to obtain credentials, and optionally region, from standard environment variables in the build process environment. These variables are _AWS_ACCESS_KEY_ID_, _AWS_SECRET_ACCESS_KEY_ and optionally _AWS_SESSION_TOKEN_. To supply the ID of the region to make the call in, e.g. us-west-2, you can also use the environment variable _AWS_REGION_.
-   EC2 instance metadata, for build hosts running on EC2 instances.
    -   Both credential and region information can be automatically obtained from the instance metadata in this scenario.

### Configuring an AWS Service Endpoint

To use _AWS_ service endpoints add the AWS subscription(s) to use by opening the Account Administration screen (gear icon on the top-right of the screen) and then click on the Services Tab. Note that each VSTS/TFS project is associated with its own set of credentials. Service endpoints are not shared across projects. You can associate a single service endpoint to be used with all AWS tasks in a build or multiple endpoints if you require.

Select the _AWS_ endpoint type and provide the following parameters. Please refer to [About Access Keys](https://aws.amazon.com/developers/access-keys/):

-   A name used to refer to the credentials when configuring the AWS tasks
-   AWS Access Key ID
-   AWS Secret Access Key

**Note** We strongly suggest you use access and secret keys generated for an Identity and Access Management (IAM) user account. You can configure an IAM user account with permissions granting access to only the services and resources required to support the tasks you intend to use in your build and release definitions.

Tasks can also use assumed role credentials by adding the Amazon Resource name (ARN) of the role to be assumed and an optional identifier when configuring the endpoint. The access and secret keys specified will then be used to generate temporary credentials for the tasks when they are executed by the build agents. Temporary credentials are valid for up to 15 minutes by default. To enable a longer validity period you can set the 'aws.rolecredential.maxduration' variable on your build or release definition, specifying a validity period in seconds between 15 minutes (900 seconds) and one hour (3600 seconds).

## Supported environments

-   Azure Devops
-   Team Foundation Server 2015 Update 3 (or higher)

**Note for Team Foundation Server 2015 Users:** Team Foundation Server 2015 users should download the extension from [here](https://sdk-for-net.amazonwebservices.com/latest/amazonwebservices.aws-vsts-tools-tfs2015.vsix). This temporary version contains the same tasks as the version in the marketplace but removes the support for extra fields in the _AWS_ endpoint type to support _Assume Role_ credentials. These fields, although marked optional, are unfortunately treated as required in TFS 2015 editions.

## License

The project is licenced under the MIT license

## Contributors

We thank the following contributor(s) for this extension: Visual Studio ALM Rangers.
