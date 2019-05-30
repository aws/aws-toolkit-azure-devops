# Test Plan

## Introduction

This document covers what we currently test, and how we test it. This document can be used to see what tested quickly without having to dig into the code and VSTS build definitions.

### High level overview

#### Categories of tests

We have three categories of tests in the project

-   Unit Tests - Unit tests are used to test the various things in `Common`, including `cloudformationutils`, `sdkutils`, etc. They all test individual functions/small groups of functions.
-   Functional Tests - Functional tests make up a majority of the tests in the project. They work by running the `execute` function of each of the tasks, and feeding it different combinations of mocked AWS objects and settings objects.
-   End to End Tests - End to end tests are handled with VSTS build definitions running on an on prem VSTS server and a deticated AWS account. We run tasks, then validate the result by querying AWS or the local filesystem. The tasks we run are available in tests/EndToEndTests.

#### Testing

The project is split into Tasks, under the `Tasks` folder, like CloudFormationCreateOrUpdate as an example.
Each Task looks like:

```
           System environment
+------+        ^
| Task |        |  Reads from
+------+--------------------------------------------------------+
|               |                                               |
|               |                    +---------------------+    |
|               |                    | Utils (like CFUtils)|    |
|               |                    +--------^------------+    |
|         +-----+--------------+              |  Calls          |
|         |   Task Parameters  |              |                 |
|         +-----+--------------+          +---+-------------+   |
|               ^                         | Task Operations |   |
|   Constructs  |                         +-------^---------+   |
|               |                                 |             |
|               |       +-----------------+       |             |
|               +-------+    Task Runner  +-------+ Runs        |
|                       |  (generated)    |                     |
|                       +------^----------+                     |
|                              |                                |
+---------------------------------------------------------------+
                               |
                         Runs  |
                               |
                               |
                    VSTS Agent |
                               +
```

And this is how each category of tests hooks into each task

```
           System environment
+------+        ^
| Task |        |  Reads from
+------+--------------------------------------------------------+
|               |                                               |
|               |                    +---------------------+    |
|               |                    | Utils (like CFUtils)<--------- Unit Tests
|               |                    +--------^------------+    |
|         +-----+--------------+              |  Calls          |
|         |   Task Parameters  |              |                 |
|         +-----+--------------+          +---+-------------+   |
|               ^                         | Task Operations <---------- Functional Tests
|   Constructs  |                         +-------^---------+   |
|               |                                 |             |
|               |       +-----------------+       |             |
|               +-------+    Task Runner  +-------+ Runs        |
|                       |  (generated)    |                     |
|                       +------^----------+                     |
|                              |                                |
+---------------------------------------------------------------+
                               |
                         Runs  |
                               |
                               | <--------------------------------- End to end tests
                    VSTS Agent |
                               +
```

## Unit Tests

Unit test coverage is limited, but CloudFormationUtils, SdkUtils, and BeanstalkUtils have
unit tests testing good and bad scenarios for every function contained in them.

## Functional Tests

All modules except for "CloudFormation Create Or Update", "Beanstalk Create Application", "AWS Powershell", and "AWS CLI"
have functional tests of some description

## End to End Tests

-   AWSCLI
    -   Runs S3 ls
    -   Runs S3 ls with role
-   AWS PowerShell
    -   Uninstall then install AWS PowerShell module by running any command
    -   **There are a ton of modules in here, currently untested, large gap**
-   AWS Shell script
    -   **untested**
-   Beanstalk Create Application Version
    -   **untested**
-   Beanstalk Create Application
    -   Deploy asp.net application
    -   Deploy asp.net core
-   Cloud Formation Create or Update
    -   Upload to s3 then update from s3
    -   Redeploy with a change
    -   Redeploy with no changes
-   Cloud Formation Delete
    -   Create then delete stack (done in 4 tasks)
-   Cloud Formation Execute Change Set
    -   **untested**
-   Code deploy deploy
    -   Build solution then deploy from workspace
    -   **deploy from s3 untested**
-   ECR push image
    -   **untested**
-   Lambda Deploy Function
    -   **untested**
-   Lambda Invoke Function
    -   Run in every deploy synchronously
-   Lambda NETCore Deploy
    -   Package then deploy
    -   Deploy .NETcore 2.1 application
    -   Deploy .NETcore 1 application
-   S3 Download
    -   Download from an s3 bucket (with normal and instance credentials)
-   S3 Upload
    -   Upload a file (with fixed and instance credentials)
    -   Upload a file with a set content encoding
-   Secrets Manager Create Secret
    -   Combined test with get (instance and fixed credentials), creates and updates
-   Secrets Manager Get Secret
    -   Combined test with create/update (instance and fixed credentials)
-   Send SQS/SNS Message
    -   Send SQS (instance and fixed credentials)
    -   Send SNS (instance and fixed credentials)
-   Systems Manager Get Parameter
    -   Set and Get combined into one (instance and fixed creds)
-   Systems Manager Run Command
    -   **untested**
-   Systems Manager Set Parameter
    -   Set and Get combined into one (instance and fixed creds)
