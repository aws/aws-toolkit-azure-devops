# Test Plan

## Introduction

This document covers what we currently test, and how we test it. This document can be used to see what tested quickly without having to dig into the code and VSTS build definitions.

### High level overview

#### Categories of tests

We have three categories of tests in the project

-   Unit Tests - Unit tests are used to test the various things in `Common`, including `cloudformationutils`, `sdkutils`, etc. They all test individual functions/small groups of functions.
-   Functional Tests - Functional tests make up a majority of the tests in the project. They work by running the `execute` function of each of the tasks, and feeding it different combinations of mocked AWS objects and settings objects.
-   End to End Tests - End to end tests are handled with VSTS build definitions running on an on prem VSTS server and a deticated AWS account. We run tasks, then validate the result by querying AWS or the local filesystem. The tasks we run are available in tests/EndToEndTests.

#### Strategy

The strategy we have adopted for tests is the following: unit tests for operations that interact
with one object/resource (typically functions), functional tests for each project

## Unit Tests

### CloudFormationUtils

### SdkUtils

## Functional Tests

### AWSCli

### AWSPowerShell

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
-
