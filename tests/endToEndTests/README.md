# Azure Devops End to End Tests

The end to end tests are Azure Devops tasks exported from Azure Devops. They are the set of tests run before a release is declared stable and cover a wide range of the tasks.

## How to use them

**NOTE** In general, no one else should have to run these tests, but if you want to:

To use them on your own Azure Devops instance, go to build and release then click on the button labeled "import". Then, select one of the JSON files. Next, set the missing info. Give it an agent to run on, and point the source towards the test projects (To be put on Github). Then, you can query builds to test the tasks.

## Variables You Might Have to Set

-   `BucketName` - Tasks that access S3 buckets require the variable `bucketName` to be set. This should be set globally, as none of the tasks stomp on each other.
-   `queueUrl` - Tasks that access SQS need a valid queue url
-   `topicArn` - Tasks that access SQS and SNS need a valid topic Arn
-   `tempDirectory` - Awsshellscript uses this variable to write a shell script to
