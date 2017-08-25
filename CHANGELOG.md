### 1.0.5 (2017-08025)

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
