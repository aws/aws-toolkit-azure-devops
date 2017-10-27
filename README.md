# Overview

The AWS Tools for Microsoft Visual Studio Team Services (VSTS) adds tasks to easily enable build and release pipelines in VSTS and Team Foundation Server to work with AWS services including Amazon S3, AWS Elastic Beanstalk, AWS CodeDeploy, AWS Lambda, AWS CloudFormation, Amazon Simple Queue Service and Amazon Simple Notification Service, and run commands using the AWS Tools for Windows PowerShell module and the AWS CLI. The tools include a new service endpoint type, *AWS*, to supply AWS credentials to the tasks at runtime.

The AWS Tools for VSTS is available from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-vsts-tools).

## Highlighted Features

### Create an AWS Credentials Connection

To work with AWS services an AWS subscription has to be linked to Team Foundation Server or to Visual Studio Team Services using the Services tab in the Account Administration section. Add the AWS subscription to use in the Build or Release Management definition by opening the Account Administration screen (gear icon on the top-right of the screen) and then click on the Services Tab.

Select the *AWS* endpoint type and provide the following parameters

- A name used to refer to the credentials when configuring tasks that require AWS credentials
- AWS Access Key ID
- AWS Secret Access Key

Please refer to [About Access Keys](https://aws.amazon.com/developers/access-keys/). Note that we strongly suggest the use of access and secret keys generated for an Identity and Access Management (IAM) user account.

You can also use assumed role credentials by adding the Amazon Resource name (ARN) of the role to be assumed and an optional identifier when configuring the endpoint. The access and secret keys specified will then be used to generate temporary credentials for the task(s) to use. Temporary credentials are valid for up to 15 minutes by default. To enable a longer validity period you can set the 'aws.rolecredential.maxduration' variable on your build or release definition, specifying a validity period in seconds between 15 minutes (900 seconds) and one hour (3600 seconds).

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