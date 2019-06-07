# Test Plan

## Introduction

This document covers what we currently test, and how we test it. This document can be used to see what is tested without having to dig into the code and VSTS build definitions.

## Overview

### Categories of tests

We have three categories of tests in the project

-   Unit Tests - Unit tests are used to test the various modules in `tasks/common`, including `cloudformationutils`, `sdkutils`, etc. They all test individual functions/small groups of functions.
-   Functional Tests - Functional tests work by running the `execute` function of each of the tasks, and feeding it different combinations of mocked AWS objects and settings objects.
-   End to End Tests - End to end tests are handled with VSTS build definitions running on an on-prem VSTS server and a dedicated AWS account. We run tasks, then validate the result by querying AWS or the local filesystem. The tasks we run are available in tests/EndToEndTests.

### Testing

Each test hooks into a task like so:

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
|               ^                         | Task Operations <-------- Functional Tests
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
                               | <----------<-----------<------------ End to end tests
                    VSTS Agent |
                               +
```

-   "Utils" and "Operations" both use AWS service clients and access the system environment as well,
    however most of these calls are to objects that are injected by way of the TaskOperations constructor.

### How we test

-   We use [Jest](https://jestjs.io/) to run unit/functional tests, and VSTS build definitions to run end to end tests
-   Tests are in the `tests` folder
    -   `taskTests` Holds unit tests and functional tests
        -   `taskTests/common` Holds all of our unit tests
        -   `taskTests/<anything-else>` Holds all of our functional tests
    -   `endToEndTests` Holds end to end build definitions
    -   `resources` Holds test resources used by the functional and unit tests
-   New modules mean new tests!

## Tests as they exist today

### Unit Tests

Unit tests are for testing individual units. This project does use a lot of classes, because
it is more like a collection of build scripts, so unit tests mostly test a file that has a theme.
Unit tests are the most important thing to add to the project when adding code because they allow
better branch coverage with less setup than the functional tests. As the project is developed further,
there needs to be an effort to break things into units that can have unit tests added.

Unit test coverage is limited. Some tasks do not have much opportunity to break up their usage into
something that could be called a unit as they only interact with services directly using parameters,
but for most other tasks unit testing should be able to be improved greatly.

#### Current tests

Currently, CloudFormationUtils, SdkUtils, and BeanstalkUtils have unit tests testing success
and failure paths for every function contained in them.

As they exist today, the current Unit Tests do not have any obvious gaps. Every part of the project that is unit testable has tests
that are meant to succeed and fail, and they have high (>80%) branch coverage.

#### Testing Gaps

The biggest gap in unit testing is that more modules need to be refactored so unit tests can be added: only a small
percentage of the project has any unit tests.

### Functional Tests

Functional tests make up the majority of tests in the project. They test how a task and all of its components come together
to work. In general, the point of functional tests is to make sure all of the units work together, and in this project they
make sure that each Task is interacting properly with the service clients and settings. This is accomplished by passing in
carefully crafted settings, and mocked implementations of service clients.

For small tasks, the functional tests have great branch coverage without being too complicated, but for larger tasks like
Beanstalk and CloudFormation, The tests are much longer. Therefore, it is preferable to grow the number of unit
tests over the number of functional tests as they currently serve the purpose of both making sure units work and function well
together.

Looking back at past releases that had issues, the second most common reason for issues was bad handling of parameters. The
functional tests are great at catching this category of problem.

All of the functional tests follow the pattern:

1. Create a `TaskParameters` object for the task
2. Modify `TaskParameters` to make it go through the desired code path
3. Create mocked service clients
4. Run `TaskName.execute()`
5. Verify service calls/failures on tasks that are supposed to fail

#### Testing Gaps

The following modules do not have any functional tests:

-   CloudFormation Create Or Update [issue #238](https://github.com/aws/aws-vsts-tools/issues/238)
-   Beanstalk Create Application [issue #239](https://github.com/aws/aws-vsts-tools/issues/239)

The following modules do not have functional tests, but it would make no sense to add them:

-   AWS Powershell
-   AWS CLI

The other major gap is most functional tests only have ~50% branch coverage. This can be improved by improving our unit tests
instead.

### End to End Tests

End to end tests serve the purpose of making sure the tasks work when actually connecting to AWS. The goal of them is not to
test every code path, but to make sure we can:

-   Connect to AWS at all/create clients that work
-   Instance and fixed credentials both work
-   Any task that does heavy build/filesystem work is tested more heavily here (Lambda, Cloudformation, and beanstalk tasks)
-   Anything that relies on the real environment is tested (like the aws shell script task or the powershell scripts)

With this in mind, the goals for end to end tests are:

1. To run every task (to see if they work at all)
2. To test instance credentials and static credentials at least once
3. To test as many code paths of tasks that lack functional test coverage as possible (tasks like aws shell script)

Looking back at past releases that had issues, the most common issue was a task not running at all, so
the first goal is by far the most important.

Here is the current list of tasks and how end to end tests currently test them. Gaps are in **bold**.

-   AWSCLI
    -   Runs S3 ls
    -   Runs S3 ls with role
-   AWS PowerShell
    -   Uninstall then install AWS PowerShell module by running any command
    -   **There are a ton of modules in here, currently untested, large gap**
-   AWS Shell script
    -   Test running an inline and existing script, and tests changing the directory the script is run in
-   Beanstalk Create Application Version
    -   Tested along with beanstalk aspnetcore fixedcreds withagentvalidationlogging by uploading the most recent version
        and tagging it with a different number
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
    -   Fail on purpose by running on nonexistant stack
    -   **no happy path tests**
-   Code deploy deploy
    -   Build solution then deploy from workspace
    -   **deploy from s3 untested**
-   ECR push image
    -   Run test in environment without docker
    -   **no happy path tests**
-   Lambda Deploy Function
    -   Deploy is part of LambdaNetCoreDeploy 2.1 fixedcreds
    -   **Deploy from s3 untested**
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
    -   Run one SSM command (AWS-ListWindowsInventory)
-   Systems Manager Set Parameter
    -   Set and Get combined into one (instance and fixed creds)
