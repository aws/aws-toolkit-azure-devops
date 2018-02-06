# Overview

The AWS Tools for Microsoft Visual Studio Team Services (VSTS) adds tasks to easily enable build and release pipelines in VSTS and Team Foundation Server to work with AWS services including Amazon S3, AWS Elastic Beanstalk, AWS CodeDeploy, AWS Lambda, AWS CloudFormation, Amazon Simple Queue Service and Amazon Simple Notification Service, and run commands using the AWS Tools for Windows PowerShell module and the AWS CLI. The tools include a new service endpoint type, *AWS*, to supply AWS credentials to the tasks when they are executed by build agents.

The AWS Tools for VSTS is available from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-vsts-tools).

**Note:** Team Foundation Server 2015 users should download the extension from [here](https://sdk-for-net.amazonwebservices.com/latest/amazonwebservices.aws-vsts-tools-tfs2015.vsix). This temporary version contains the same tasks as the version in the marketplace but removes the support for *Assume Role* credentials in the AWS endpoint type while we address a compatibility issue with this version of TFS.

## Highlighted Features

### Create an AWS Credentials Connection for a Project

To work with AWS services an AWS subscription has to be linked to each project in Team Foundation Server or Visual Studio Team Services using the Services tab in the Account Administration section. Add the AWS subscription to use by opening the Account Administration screen (gear icon on the top-right of the screen) and then click on the Services Tab. Each VSTS/TFS project is associated with its own set of credentials. **The credentials are used by the VSTS/TFS build agents when running builds and/or releases for a project containing tasks from the AWS tools.**

Select the *AWS* endpoint type and provide the following parameters. Please refer to [About Access Keys](https://aws.amazon.com/developers/access-keys/):

- A name used to refer to the credentials when configuring the AWS tasks
- AWS Access Key ID
- AWS Secret Access Key

The credentials associated with the project are used by VSTS or TFS build agents that execute the AWS tasks you configure in your build and/or release pipelines. You can associate a single set of credentials to be used in all AWS tasks in a project or you can associate multiple sets of credentials. Project team members reference the associated credentials when configuring tasks for a project's build and/or release definitions.

**Note** We strongly suggest you use access and secret keys generated for an Identity and Access Management (IAM) user account. You can configure an IAM user account with permissions granting access to only the services and resources required to support the tasks you intend to use in your build and release definitions.

Tasks can also use assumed role credentials by adding the Amazon Resource name (ARN) of the role to be assumed and an optional identifier when configuring the endpoint. The access and secret keys specified will then be used to generate temporary credentials for the tasks when they are executed by the build agents. Temporary credentials are valid for up to 15 minutes by default. To enable a longer validity period you can set the 'aws.rolecredential.maxduration' variable on your build or release definition, specifying a validity period in seconds between 15 minutes (900 seconds) and one hour (3600 seconds).

![aws endpoint](images/AWSEndpoint.png)

### Transfer Files to and from Amazon S3 Buckets

Upload files to an Amazon Simple Storage Service (S3) Bucket with the AWS S3 Upload task or download from a bucket with the AWS S3 Download task.

![s3 upload](images/AWSS3Upload.png)

### Deploy .NET Core serverless applications or standalone functions to AWS Lambda

![lambda appdeploy](images/AWSLambdaDeploy.png)

### Invoke an AWS Lambda Function

Invoke Lambda functions from within the build or release pipeline.

![CLI](images/AWSLambdaFunction.png)

### Create/update AWS CloudFormation stacks

Create new AWS CloudFormation stacks or update an existing stack.

![CloudFormation](images/AWSCloudFormation.png)

### Deploy to AWS Elastic Beanstalk

Deploy ASP.NET or ASP.NET Core applications to Elastic Beanstalk environments.

![Beanstalk](images/AWSElasticBeanstalk.png)

### Deploy to Amazon EC2 with AWS CodeDeploy

Deploy applications to EC2 instances using CodeDeploy.

![CodeDeploy](images/AWSCodeDeploy.png)

### Send a message to an Simple Notification Service Topic or Simple Queue Service Queue

![SNSTopic](images/AWSSendMessage.png)

### Run AWS Tools for Windows PowerShell scripts

Run scripts using cmdlets from the AWS Tools for Windows PowerShell (AWSPowerShell) module, optionally installing the module before use.

![AWSPowerShell](images/AWSPowerShellScript.png)

### Run AWS CLI commands

Run AWS CLI commands against an AWS connection.

![AWSCLI](images/AWSCLI.png)

## Minimum supported environments

- Visual Studio Team Services
- Team Foundation Server 2015 Update 3 (or higher)

## Contributors

We thank the following contributor(s) for this extension: Visual Studio ALM Rangers.