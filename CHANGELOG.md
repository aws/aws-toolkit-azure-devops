### 1.0.21 (2018-03-22)

* Issue #71: Extended the CloudFormation CreateorUpdateStack task to enable parameters to be specified inline in the task definition in addition to an external file.
* Issue #72: Fixed DeployApplication and CreateApplicationVersion tasks for Elastic Beanstalk so that user-supplied description is not ignored.
* Pull request #70: Enable parameters to the CloudFormation CreateOrUpdateStack task to be specified as JSON or YAML formatted content.

### 1.0.20 (2018-02-12)

* Added extra diagnostic logging to the tests for application and environment existence in the Elastic Beanstalk Create Application Version and Deploy Application tasks.

### 1.0.19 (2018-02-06)

* Corrected missing task icon for the new Beanstalk Create Application Version task.

### 1.0.18 (2018-02-06)

* Added new Create Application Version task for AWS Elastic Beanstalk to enable creation of a new revision for an application without deploying the revision to an environment. This task is designed to support usage scenarios requiring a single revision be deployed to multiple environments for the application, where the existing deployment task would error out due to the revision already existing during deployment to environments updated subsequent to the first. The new revision can be associated with the build artifacts of an ASP.NET or ASP.NET Core web application in the build workspace or an existing application bundle uploaded previously to Amazon S3. When using an automatically created version label for the new revision the version label can also be captured into a build variable for use in downstream tasks.
* Updated the existing Elastic Beanstalk deployment task to allow a revision previously created with the new Create Application Revision task to be specified, or a bundle previously uploaded to Amazon S3, as the source of the deployment artifacts to an environment.  When using an automatically created version label for the new revision the version label can also be captured into a build variable for use in downstream tasks.
* Updated the Systems Manager Get Parameter task to enable specific parameter versions to be specified (when reading a single parameter value). By default the task reads the latest version of a parameter value.
* Updated the CloudFormation CreateOrUpdateStack task to support rollback triggers.

### 1.0.17 (2018-01-15)

* Updated the general-purpose Lambda deployment task for the newly supported 'dotnetcore2.0' and 'go1.x' runtimes.
* Extended the CodeDeploy task to allow the deployment bundle archive to be specified as a file previously uploaded to Amazon S3, in addition to the existing support for pointing at a file or folder location in the build workspace (https://github.com/aws/aws-vsts-tools/issues/55).

### 1.0.16

* This version was only released internally for testing.

### 1.0.15 (2017-12-18)

* Updated the Amazon S3 Upload and Download tasks to support server-side encryption options. You can elect to encrypt data at rest using an Amazon S3 provided key, or your own key.
* Updated the Amazon S3 Upload task to enable specifying storage class for the upload objects. Supported storage classes are *STANDARD* (the default), *STANDARD_IA* and *REDUCED_REDUNDANCY*.

### 1.0.14 (2017-11-30)

* Added new tasks:
  * Push Docker image to Elastic Container Registry Service
  * New general purpose AWS Lambda deployment task
  * Read parameters from Systems Manager Parameter Store
  * Systems Manager Run Command
* Updated the AWS CloudFormation CreateOrUpdateStack task:
  * Added support for specifying the template location in Amazon S3.
  * Added support (Pull Request #39) for specifying tags for the stack resources.
* Updated the Elastic Beanstalk task to allow specifying a custom version label for the deployment. If not specified the task auto-creates a version label based on the current date/time.
* Updated the AWS CLI and AWS Tools for Windows PowerShell tasks to use environment variables for AWS credentials, rather than writing credential profiles to disk. This enables better handling of parallel builds from different users on the same build agent.
* Updated the S3 Download task to add 'flatten folders' option. This option, off by default, removes the key prefix from the downloaded object so that the object is created in the target folder, not a subfolder corresponding to the key prefix.
* Merged PR #42 to fix an issue with 'external ID' in assume role credentials being used when empty string, which caused the attempt to create temporary credentials to be rejected.

### 1.0.13 (2017-11-13)

* Fixed [issue](https://github.com/aws/aws-vsts-tools/issues/37) with the Lambda .NET Core deployment task ignoring any value specified for the Function Handler variable declared on the task.

### 1.0.12 (2017-10-27)

* Added support for detecting proxy settings on agents and configuring the tasks to use the proxy.
* Extended support for assume role credentials to the AWSCLI and LambdaNETCoreDeploy tasks.
* Extended the AWS endpoint type to also support cross-account assume role credentials, where an external ID may need to be specified.

### 1.0.11 (2017-10-26)

* Fixed various issues caused by a second copy of the AWS SDK for Node.js being included in tasks.

### 1.0.10 (2017-10-25)

* Added the ability to configure credentials based on assuming a role to the AWS endpoint type, supported by all tasks except for the AWS CLI task. We will extend assume-role capability to the AWS CLI task in a future update.

### 1.0.8 (2017-10-23)

* Fixed issue with missing tasks after installation of the tools into Team Foundation Server 2015.
    https://github.com/aws/aws-vsts-tools/issues/33 and https://github.com/aws/aws-vsts-tools/issues/23.

* Fixed bug in CloudFormationCreateOrUpdateStack task. When updating multiple stacks in a pipeline using change sets, if earlier stacks in the pipeline had no changes the task would error out. The fix switches the task to instead emit a warning to the build log for stacks where no changes are detected.
    https://github.com/aws/aws-vsts-tools/issues/28.

* Updated the AWS service endpoint type so the access key field does not default to 'IsConfidential'. This helps verifying credential rotation when updating the endpoint. This change does not affect or modify the secret key field in the endpoint.
    https://github.com/aws/aws-vsts-tools/pull/30.

* Added request/response header and AWS request id logging diagnostics to tasks that invoke AWS service APIs using the AWS SDK for Node.js. The service response's request id value is always emitted to the debug log for a task (viewable when the system.debug variable is set true). Additionally tasks can be configured to emit request and response headers to the debug log using new diagnostic options in the task parameters. This information can be useful when contacting AWS support.

* Added 'Force path style addressing' parameter to the S3 upload and download tasks. The default addressing for S3 buckets when using these tasks is to use
  virtual host style if the bucket name is DNS compatible, otherwise path style. If this option is selected path style will always be used.

### 1.0.7 (2017-09-14)

* Fixed issue with CodeDeploy deployment task not setting output variable (https://github.com/aws/aws-vsts-tools/pull/19)

### 1.0.6 (2017-09-08)

* Fixed issue with S3 Upload task to correctly find files with user given GLOB.

### 1.0.5 (2017-08-25)

* Corrected casing of some field types in the task definitions to fix issues with on-premise TFS 2017 installations not showing some fields in the CloudFormation tasks.

### 1.0.4 (2017-08-23)

* Fixed issue handling otional arguments to the AWS CLI task. The original processing resulted in the arguments being enclosed in quotes which (depending on the command) could lead to an error being returned by the CLI.

### 1.0.3 (2017-08-23)

* Fixed issue in the AWS CLI task when configuring credentials and default region.
* Fixed issue in the AWS CloudFormation CreateOrUpdateStack task when a parameters file is not specified.
* Updated the extension manifest to correct the placement of the repository info.
* Updated the readme.md file to include a link to the Visual Studio Marketplace entry for the tools.

### 1.0.2 (2017-08-17)

* Updated the S3 Upload task to enable content type to be set automatically based on inspection of file extension, or by using a new task parameter to set content type for all files being uploaded.
* Updated public repository link (https://github.com/aws/aws-vsts-tools/pull/2)
* Updated the AWS CLI task help markdown to clarify that the AWS CLI must have been installed prior to using the task.

### 1.0.1 (2017-08-15)

* Initial release.
