## 1.5.1 2020-01-27

-   **Feature** Add support for Session Token in endpoint definition

## 1.5.0 2019-08-12

-   **Bug Fix** Fix issue #270 by adding tags on lambda update
-   **Bug Fix** Fix issue #272 by no longer printing the command
-   **Bug Fix** Fix issue #259: auto-install new version of the lambda tools globally if required.
-   **Feature** Add the ability to set CacheControl for an upload to S3 (issue #50)
-   **Feature** Add ECR pull task (issue #169)
-   **Feature** Issue #133 support for Lambda Layers
-   **Feature** Refresh list of Lambda runtimes to the currently supported runtimes
-   **Removal** Remove Lambda .NET Core 1.0, it is EOL

### 1.4.0 (2019-06-18)

-   Issue #254, fix default working directory for AWS Shell Script
-   Issue #255, Fix bug when not putting in tags or environment variables on lambda deploy

### 1.3.0 (2019-06-11)

-   Issue #251, Hotfix credentials not working

### 1.2.0 (2019-06-11)

-   Issue #195, Fix Lambda Invoke printing output when not outputting to an outputVariable
-   Issue #220, Update task names and descriptions to make sure every task can be found with either the full official name of the service or the official acronym
-   Issue #215, Update icons to the new AWS style
-   Issue #215, Fix aws.rolecredential.maxduration being set incorrectly when it is overwritten
-   Issue #114, Add support to specifiy content encoding on s3 upload task
-   Issue #126, fix for use of assume role credentials in Lambda .NET Core deployment task. The task did not wait for temporary credentials to be generated once it obtained the credential object bound in the task parameters.
-   Issue #124, fix for missing permissions on the Elastic Beanstalk Deploy Application task documentation.
-   Merged PR #123, fix for missing permissions on the ECR Push Image task documentation.
-   Updated the Elastic Beanstalk Deploy Application task to detect when throttling errors exhaust the underlying SDKs retry capability and to automatically extend the event polling delay by some random amount instead of failing the task. The task also adds a random start delay prior to the first poll for events so that multiple simultaneous deployments do not all start event polling at, or very close to, the same time which could also lead to early throttling errors.
-   Issue #114, added support for specifying custom content encoding in the S3 Upload task.
-   Issue #106, added the ability to the CloudFormation Create/Update Stack and Execute Change Set tasks to enable capturing the declared outputs from a stack into build variables as either individual outputs using the output names as the build variable names or as a JSON-formatted blob using the stack name suffixed with 'Outputs' as the variable name. To prevent secrets being accidentally echoed to console logs the build variables are created in secured mode which can be overridden in the task configuration.
-   Issue #127, extended CloudFormation Create/Update Stack task to allow use of previous template when performing an update.

### 1.1.8 (2018-11-01)

-   Issue #117, updated build process for version and region picker information to fix issues with unrecognized task ids and missing icons in Azure DevOps Server. There are no task changes in this release.

### 1.1.7 (2018-10-24)

-   Fixed issue #112, shell task not initialized correctly when a role-based credential endpoint was used.
-   Issue #115, added option to the Elastic Beanstalk deployment task allowing configuration of event polling frequency during deployment. The default (and minimum) delay is 5 seconds. Users can now specify a custom delay of up to 5 minutes (300 seconds) to help avoid throttling errors from the service when multiple deployments are in progress, all polling for events.

### 1.1.6 (2018-10-01)

-   Bug fix to remove duplicate webpacked copy of the AWS SDK for Node.js which was causing issues with the user agent string set by the tools.

### 1.1.5 (2018-08-28)

-   Update to the AWS CloudFormation Create/Update Stack task to accommodate changed messages and error states when a stack update results in no work.

### 1.1.4

-   Used for internal testing, not released publicly.

### 1.1.3 (2018-08-08)

-   Fixed issue #96. CLI task not forcing creation of an initial set of credentials when using a service endpoint based on an assumed role. Also removed
    caching of credentials and region inside the core code so as to avoid potential consistency issues going forward.
-   Additional update for issue #95, to check the selected build host has the -AllowClobber switch available for use with Install-Module and to always
    install/update NuGet provider to ensure we have access to a version of Install-Module that supports the -Force switch. If -AllowClobber is not available
    on the hosted agent we will fall back to standard Install-Module which is slow (per what was discovered in issue #51).

### 1.1.2 (2018-08-07)

-   Fixed issue #95, need to revert to using Install-Module instead of Save-Module for the AWS PowerShell Module Script task. The use of Save-Module
    was introduced to try and solve performance issues reported in issue #51 however it does lead to the module being placed in a temp location and thus
    it isn't auto-import compatible causing issues when run on build hosts where the module hadn't previously been cached in an auto-import compatible
    location.

### 1.1.1 (2018-08-03)

-   Fix for issue #94, AWS PowerShell Module Script task needs to obtain region data before credential discovery so that if an endpoint is specified
    that defines an assumed role, we have region set in the process before attempting to call the Use-STSRole cmdlet to get temporary credentials based
    on the role.

### 1.1.0 (2018-08-02)

-   The AWS Credentials property for referencing a service endpoint when configuring tasks is now optional (Issue #34).

    If the name of a service endpoint is not specified in the task configuration the task will attempt to recover credentials at run time from the following additional sources, in order:

    -   From Team Services variables named _AWS.AccessKeyId_, _AWS.SecretAccessKey_ and _AWS.SessionToken_.
    -   From standard AWS environment variables in the build agent process (_AWS_ACCESS_KEY_ID_, _AWS_SECRET_ACCESS_KEY_ and _AWS_SESSION_TOKEN_).
    -   (If the build agent is running on Amazon EC2 instances) From EC2 instance metadata. For credentials to be available from EC2 instance
        metadata the instance must have been started with an instance profile referencing a role granting permissions to the task to make calls to
        AWS on your behalf. See [Using an IAM Role to Grant Permissions to Applications Running on Amazon EC2 Instances](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html) for more information.

-   The AWS Region property for configuring the region in which tasks will operate is now optional. If a region is not configured on a task the task will attempt to obtain region information at run time from the following sources, in order:

    -   From a Team Services variable named _AWS.Region_.
    -   From the standard AWS environment variable in the build agent process (_AWS_REGION_)
    -   (If the build agent is running on Amazon EC2 instances) From EC2 instance metadata.

-   Updated the AWS Region task configuration property to be a drop-down picker of known regions at the time of release. You can also type in the region name (_us-west-2_ etc) in the field to allow for use of regions released in the future without needing to update the tools first.
-   Added new task: _AWS Shell_. This task can be used to execute a Bash script in a shell with the standard AWS environment variables for credentials and region set. (Issue #54)
-   Added new task: _AWS Systems Manager Set Parameter_. This task can be used to create and update parameters in the Systems Manager Parameter Store from within your builds.
-   Added new tasks: _AWS Secrets Manager Create/Update Secret_ and _AWS Secrets Manager Get Secret_. These tasks can be used to manage secrets in the Secrets Manager store and also fetch the value of a secret into a Team Services build variable.
-   Added the ability to set a custom timeout (in minutes) to the _AWS CodeDeploy Deploy Application_ task (Pull request #90/Issue #87)
-   Updated the _AWS CloudFormation Create/Update Stack_ task to enable setting a custom timeout in minutes. (Issue #85)
-   Updated the _AWS CloudFormation Create/Update Stack_ task with an option to allow suppression of the warning message when the service detects a stack update yielded no work to be done. (Issue #91)
-   Updated the _AWS Lambda Deploy Function_ task to support the new .NET Core 2.1 runtime in the runtime selection picker. This field has also now been made editable so that as new runtimes are added in future they can be used without needing the tools to be updated. (Issue #86)
-   Updated the _AWS Lambda .NET Core Deployment_ task to support package-only build mode. In conjunction with the _AWS Lambda Deploy Function_ and _AWS CloudFormation Create/Update Stack_ tasks it is now possible to create your Lambda function or serverless application package in a build pipeline and perform the actual deployment to AWS Lambda or AWS CloudFormation in a release pipeline.
-   Updated the _AWS Tools for Windows PowerShell_ task to use Save-Module instead of Install-Module when downloading and installing the module during a build. This was found to significanly improve the execution time of the install phase. (Issue #51)

### 1.0.22 (2018-07-09)

-   Added support for the .NET Core 2.1 runtime in the AWS Lambda Deploy Function task.

### 1.0.21 (2018-03-22)

-   Issue #71: Extended the CloudFormation CreateorUpdateStack task to enable parameters to be specified inline in the task definition in addition to an external file.
-   Issue #72: Fixed DeployApplication and CreateApplicationVersion tasks for Elastic Beanstalk so that user-supplied description is not ignored.
-   Pull request #70: Enable parameters to the CloudFormation CreateOrUpdateStack task to be specified as JSON or YAML formatted content.

### 1.0.20 (2018-02-12)

-   Added extra diagnostic logging to the tests for application and environment existence in the Elastic Beanstalk Create Application Version and Deploy Application tasks.

### 1.0.19 (2018-02-06)

-   Corrected missing task icon for the new Beanstalk Create Application Version task.

### 1.0.18 (2018-02-06)

-   Added new Create Application Version task for AWS Elastic Beanstalk to enable creation of a new revision for an application without deploying the revision to an environment. This task is designed to support usage scenarios requiring a single revision be deployed to multiple environments for the application, where the existing deployment task would error out due to the revision already existing during deployment to environments updated subsequent to the first. The new revision can be associated with the build artifacts of an ASP.NET or ASP.NET Core web application in the build workspace or an existing application bundle uploaded previously to Amazon S3. When using an automatically created version label for the new revision the version label can also be captured into a build variable for use in downstream tasks.
-   Updated the existing Elastic Beanstalk deployment task to allow a revision previously created with the new Create Application Revision task to be specified, or a bundle previously uploaded to Amazon S3, as the source of the deployment artifacts to an environment. When using an automatically created version label for the new revision the version label can also be captured into a build variable for use in downstream tasks.
-   Updated the Systems Manager Get Parameter task to enable specific parameter versions to be specified (when reading a single parameter value). By default the task reads the latest version of a parameter value.
-   Updated the CloudFormation CreateOrUpdateStack task to support rollback triggers.

### 1.0.17 (2018-01-15)

-   Updated the general-purpose Lambda deployment task for the newly supported 'dotnetcore2.0' and 'go1.x' runtimes.
-   Extended the CodeDeploy task to allow the deployment bundle archive to be specified as a file previously uploaded to Amazon S3, in addition to the existing support for pointing at a file or folder location in the build workspace (https://github.com/aws/aws-vsts-tools/issues/55).

### 1.0.16

-   This version was only released internally for testing.

### 1.0.15 (2017-12-18)

-   Updated the Amazon S3 Upload and Download tasks to support server-side encryption options. You can elect to encrypt data at rest using an Amazon S3 provided key, or your own key.
-   Updated the Amazon S3 Upload task to enable specifying storage class for the upload objects. Supported storage classes are _STANDARD_ (the default), _STANDARD_IA_ and _REDUCED_REDUNDANCY_.

### 1.0.14 (2017-11-30)

-   Added new tasks:
    -   Push Docker image to Elastic Container Registry Service
    -   New general purpose AWS Lambda deployment task
    -   Read parameters from Systems Manager Parameter Store
    -   Systems Manager Run Command
-   Updated the AWS CloudFormation CreateOrUpdateStack task:
    -   Added support for specifying the template location in Amazon S3.
    -   Added support (Pull Request #39) for specifying tags for the stack resources.
-   Updated the Elastic Beanstalk task to allow specifying a custom version label for the deployment. If not specified the task auto-creates a version label based on the current date/time.
-   Updated the AWS CLI and AWS Tools for Windows PowerShell tasks to use environment variables for AWS credentials, rather than writing credential profiles to disk. This enables better handling of parallel builds from different users on the same build agent.
-   Updated the S3 Download task to add 'flatten folders' option. This option, off by default, removes the key prefix from the downloaded object so that the object is created in the target folder, not a subfolder corresponding to the key prefix.
-   Merged PR #42 to fix an issue with 'external ID' in assume role credentials being used when empty string, which caused the attempt to create temporary credentials to be rejected.

### 1.0.13 (2017-11-13)

-   Fixed [issue](https://github.com/aws/aws-vsts-tools/issues/37) with the Lambda .NET Core deployment task ignoring any value specified for the Function Handler variable declared on the task.

### 1.0.12 (2017-10-27)

-   Added support for detecting proxy settings on agents and configuring the tasks to use the proxy.
-   Extended support for assume role credentials to the AWSCLI and LambdaNETCoreDeploy tasks.
-   Extended the AWS endpoint type to also support cross-account assume role credentials, where an external ID may need to be specified.

### 1.0.11 (2017-10-26)

-   Fixed various issues caused by a second copy of the AWS SDK for Node.js being included in tasks.

### 1.0.10 (2017-10-25)

-   Added the ability to configure credentials based on assuming a role to the AWS endpoint type, supported by all tasks except for the AWS CLI task. We will extend assume-role capability to the AWS CLI task in a future update.

### 1.0.8 (2017-10-23)

-   Fixed issue with missing tasks after installation of the tools into Team Foundation Server 2015.
    https://github.com/aws/aws-vsts-tools/issues/33 and https://github.com/aws/aws-vsts-tools/issues/23.

-   Fixed bug in CloudFormationCreateOrUpdateStack task. When updating multiple stacks in a pipeline using change sets, if earlier stacks in the pipeline had no changes the task would error out. The fix switches the task to instead emit a warning to the build log for stacks where no changes are detected.
    https://github.com/aws/aws-vsts-tools/issues/28.

-   Updated the AWS service endpoint type so the access key field does not default to 'IsConfidential'. This helps verifying credential rotation when updating the endpoint. This change does not affect or modify the secret key field in the endpoint.
    https://github.com/aws/aws-vsts-tools/pull/30.

-   Added request/response header and AWS request id logging diagnostics to tasks that invoke AWS service APIs using the AWS SDK for Node.js. The service response's request id value is always emitted to the debug log for a task (viewable when the system.debug variable is set true). Additionally tasks can be configured to emit request and response headers to the debug log using new diagnostic options in the task parameters. This information can be useful when contacting AWS support.

-   Added 'Force path style addressing' parameter to the S3 upload and download tasks. The default addressing for S3 buckets when using these tasks is to use
    virtual host style if the bucket name is DNS compatible, otherwise path style. If this option is selected path style will always be used.

### 1.0.7 (2017-09-14)

-   Fixed issue with CodeDeploy deployment task not setting output variable (https://github.com/aws/aws-vsts-tools/pull/19)

### 1.0.6 (2017-09-08)

-   Fixed issue with S3 Upload task to correctly find files with user given GLOB.

### 1.0.5 (2017-08-25)

-   Corrected casing of some field types in the task definitions to fix issues with on-premise TFS 2017 installations not showing some fields in the CloudFormation tasks.

### 1.0.4 (2017-08-23)

-   Fixed issue handling otional arguments to the AWS CLI task. The original processing resulted in the arguments being enclosed in quotes which (depending on the command) could lead to an error being returned by the CLI.

### 1.0.3 (2017-08-23)

-   Fixed issue in the AWS CLI task when configuring credentials and default region.
-   Fixed issue in the AWS CloudFormation CreateOrUpdateStack task when a parameters file is not specified.
-   Updated the extension manifest to correct the placement of the repository info.
-   Updated the readme.md file to include a link to the Visual Studio Marketplace entry for the tools.

### 1.0.2 (2017-08-17)

-   Updated the S3 Upload task to enable content type to be set automatically based on inspection of file extension, or by using a new task parameter to set content type for all files being uploaded.
-   Updated public repository link (https://github.com/aws/aws-vsts-tools/pull/2)
-   Updated the AWS CLI task help markdown to clarify that the AWS CLI must have been installed prior to using the task.

### 1.0.1 (2017-08-15)

-   Initial release.
