# Overview

Coverage: [![codecov](https://codecov.io/gh/aws/aws-vsts-tools/branch/master/graph/badge.svg)](https://codecov.io/gh/aws/aws-vsts-tools)

The AWS Toolkit for Azure DevOps adds tasks to easily enable build and release pipelines in Azure DevOps (formerly VSTS) and Azure DevOps Server (previously known as Team Foundation Server (TFS)) to work with AWS services including Amazon S3, AWS Elastic Beanstalk, AWS CodeDeploy, AWS Lambda, AWS CloudFormation, Amazon Simple Queue Service and Amazon Simple Notification Service, and run commands using the AWS Tools for Windows PowerShell module and the AWS CLI.

The AWS Toolkit for Azure DevOps is available from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-vsts-tools).

This is an open source project because we want you to be involved. We love issues, feature requests, code reviews, pull
requests or any positive contribution. Please see the the [CONTRIBUTING](CONTRIBUTING.md) guide for how to help, including how to build your own extension.

## Highlighted Features

-   AWSCLI - Interact with the AWSCLI (Windows hosts only)
-   AWS Powershell Module - Interact with AWS through powershell (Windows hosts only)
-   Beanstalk - Deploy ElasticBeanstalk applications
-   CodeDeploy - Deploy with CodeDeploy
-   CloudFormation - Create/Delete/Update CloudFormation stacks
-   ECR - Push an image to an ECR repository
-   Lambda - Deploy from S3, .net core applications, or any other language that builds on Azure DevOps
-   S3 - Upload/Download to/from S3 buckets
-   Secrets Manager - Create and retrieve secrets
-   SQS - Send SQS messages
-   SNS - Send SNS messages
-   Systems manager - Get/set parameters and run commands

## User Guide

The [User Guide](https://docs.aws.amazon.com/vsts/latest/userguide/welcome.html) contains additional instructions for getting up and running with the extension.

## Credentials Handling for AWS Services

To enable tasks to call AWS services when run as part of your build or release pipelines AWS credentials need to have been configured for the tasks or be available in the host process for the build agent. Note that the credentials are used specifically by the tasks when run in a build agent process, they are not related to end-user logins to your Azure DevOps instance.

The AWS tasks support the following mechanisms for obtaining AWS credentials:

One or more service endpoints, of type _AWS_, can be created and populated with either:

-   Static credentials in the form of AWS access and secret keys, and optionally data for _Assumed Role_ credentials.
-   If only the _Assumed Role_ is defined but neither access key ID nor secret key, the role be assumed regardless. This is useful when using instance profices, and and profile only allows to assume a role.
-   If the useOIDC is checked and you have defined an _Assumed Role_ without access key ID or secret key. This will request an OIDC token from Azure Devops and federate into AWS with than token.

    -   This will require a trust policy on the _Assume Role_ similar to this :

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": "arn:aws:iam::123456789012:oidc-provider/vstoken.dev.azure.com/{org-id}"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringEquals": {
                        "vstoken.dev.azure.com/{org-id}:sub": "sc://{orgName}/{ProjectName}/{ServiceConnections}",
                        "vstoken.dev.azure.com/{org-id}": "api://AzureADTokenExchange"
                    }
                }
            }
        ]
    }
    ```

    You'll also have to setup the OIDC Provider, you can use the documentation of [Creating and managing an OIDC provider](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html#manage-oidc-provider-console)

-   Variables defined on the task or build.
    -   If tasks are not configured with the name of a service endpoint they will attempt to obtain credentials, and optionally region, from variables defined in the build environment. The
        variables are named _AWS.AccessKeyID_, _AWS.SecretAccessKey_ and optionally _AWS.SessionToken_. To supply the ID of the region to make the call in, e.g. us-west-2, you can also use the variable _AWS.Region_. Optionally a role to assume can be specified by using the variable _AWS.AssumeRoleArn_. When assuming roles _AWS.RoleSessionName_ (optional) and _AWS.ExternalId_ (optional) can be provided in order to specify an identifier for the assumed role session and an external id to show in customers' accounts when assuming roles.
-   Environment variables in the build agent's environment.
    -   If tasks are not configured with the name of a service endpoint, and credentials or region are not available from task variables, the tasks will attempt to obtain credentials, and optionally region, from standard environment variables in the build process environment. These variables are _AWS_ACCESS_KEY_ID_, _AWS_SECRET_ACCESS_KEY_ and optionally _AWS_SESSION_TOKEN_. To supply the ID of the region to make the call in, e.g. us-west-2, you can also use the environment variable _AWS_REGION_.
-   EC2 instance metadata, for build hosts running on EC2 instances.
    -   Both credential and region information can be automatically obtained from the instance metadata in this scenario.

### Configuring an AWS Service Endpoint

To use _AWS_ service endpoints add the AWS subscription(s) to use by opening the Account Administration screen (gear icon on the top-right of the screen) and then click on the Services Tab. Note that each Azure DevOps project is associated with its own set of credentials. Service endpoints are not shared across projects. You can associate a single service endpoint to be used with all AWS tasks in a build or multiple endpoints if you require.

Select the _AWS_ endpoint type and provide the following parameters based on the type of authentification above.

#### OIDC Federation

-   A name used to refer to the credentials when configuring the AWS tasks
-   The arn of the role to assume
-   Check the useOIDC options

#### Static credentials

Please refer to [About Access Keys](https://aws.amazon.com/developers/access-keys/):

-   A name used to refer to the credentials when configuring the AWS tasks
-   AWS Access Key ID
-   AWS Secret Access Key

#### Assume Role

Tasks can also use assumed role credentials by adding the Amazon Resource name (ARN) of the role to be assumed and an optional identifier when configuring the endpoint. The access and secret keys specified will then be used to generate temporary credentials for the tasks when they are executed by the build agents. Temporary credentials are valid for up to 15 minutes by default. To enable a longer validity period you can set the 'aws.rolecredential.maxduration' variable on your build or release definition, specifying a validity period in seconds between 15 minutes (900 seconds) and 12 hours (43200 seconds).

> [!NOTE]
> We strongly suggest to use the OIDC Federation to avoid having to maintain static credentials. You can configure an IAM role with permissions granting access to only the services and resources required to support the tasks you intend to use in your build and release definitions.

## Supported environments

-   Azure DevOps
-   Team Foundation Server 2017 Update 1 (or higher) (now called Azure DevOps Server)

## License

The project is licensed under the MIT license

## Contributors

We thank the following contributor(s) for this extension: Visual Studio ALM Rangers.
