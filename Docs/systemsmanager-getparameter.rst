.. Copyright 2010-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _systemsmanager-getparameter:
.. _IAMRolesForEC2: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html

#################################
AWS Systems Manager Get Parameter
#################################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Reads one or more values from Systems Manager's Parameter Store into build variables.

Description
===========

This task reads a parameter value, or hierarchy of values identified by common path, into
build variables in the build or release definition. These variables are then accessible from
downstream tasks in the definition. The names used for the build variables are customizable.

Parameters
==========

You can set the following parameters for the task. Required parameters are noted by
an asterisk (*). Other parameters are optional.

Display name*
-------------

    The default name of the task instance, which can be modified: Systems Manager Get Parameter

AWS Credentials
---------------

    Specifies the AWS credentials to be used by the task in the build agent environment.

    You can specify credentials using a service endpoint (of type AWS) in the task configuration or you can leave unspecified. If
    unspecified the task will attempt to obtain credentials from the following sources in order:

    * From task variables named *AWS.AccessKeyID*, *AWS.SecretAccessKey* and optionally *AWS.SessionToken*.
    * From credentials set in environment variables in the build agent process. When using environment variables in the
      build agent process you may use the standard AWS environment variables: *AWS_ACCESS_KEY_ID*, *AWS_SECRET_ACCESS_KEY* and
      optionally *AWS_SESSION_TOKEN*.
    * If the build agent is running on an Amazon EC2 instance, from the instance metadata associated with the EC2 instance. For
      credentials to be available from EC2 instance metadata the instance must have been started with an instance profile referencing
      a role granting permissions to the task to make calls to AWS on your behalf. See IAMRolesForEC2_ for more information.

AWS Region
----------

    The AWS region code (us-east-1, us-west-2 etc) of the region containing the AWS resource(s) the task will use or create. For more
    information, see :aws-gr:`Regions and Endpoints <rande>` in the |AWS-gr|.

    If a region is not specified in the task configuration the task will attempt to obtain the region to be used using the standard
    AWS environment variable *AWS_REGION* in the build agent process's environment. Tasks running in build agents hosted on Amazon EC2
    instances (Windows or Linux) will also attempt to obtain the region using the instance metadata associated with the EC2 instance
    if no region is configured on the task or set in the environment variable.

    **Note:** The regions listed in the picker are those known at the time this software was released. New regions that are not listed
    may still be used by entering the *region code* of the region (for example *us_west_2*).

Read Mode*
----------

    Whether the task gets the value of a single named parameter or values from a parameter hierarchy identified by common parameter path.

Parameter Name
--------------

    The name identifying a single parameter to be read from the store. Required if *Read Mode* is set to *Get value for single parameter*.

Parameter Version
-----------------

    If unspecified the value associated with the latest version of the parameter is read. If specified the task requests the value associated with the supplied version. Parameter versions start at at 1 and increment each time a new value is stored for the parameter.

    This field is only available when Read Mode is set to get a single parameter value.

Parameter Path
--------------

    The path hierarchy for the parameter(s) to be read. Hierarchies start with, and are separated by, a forward slash (/) and may contain up to five levels. The path hierarchy can identify a specific parameter in the hierarchy by appending the parameter name, or can identify a group of parameters sharing the hierarchy path. If the supplied hierarchy contains multiple parameters, all parameter values in the hierachy are downloaded.

    **Note:** *SecureString* parameters found in a hierachy will be automatically set as secret variables.

    Required if *Read Mode* is set to *Get values for parameter hierarchy*.

Recursive
---------

    Available when reading a parameter hierarchy. If selected then parameter values for the specified *Parameter Path* and all sub-paths are read. If not selected only the values for parameters matching the supplied path are read, values in sub-paths are ignored.

Variable Name Transform
-----------------------

    Specifies how the build variable name(s) to hold the parameter value(s) are created. You can choose from

    * Use parameter names (including any paths) as variable names. The full parameter name is used to set the build variable name.
    * Use leaf of parameter names as variable names. The path is removed and the resulting leaf text is used as the build variable name.
    * Replace text in the parameter name using a regular expression to form the
      build variable name.
    * Use custom name. Available for single parameter read mode only, enables entry of a custom name for the build variable.

Custom Variable Name
--------------------

    The name of the build variable to hold the parameter value. This value is required if *Variable Name Transform* is set to *Use custom name*.

Search Pattern
--------------

    A regular expression defining the text in the parameter name that is to be replaced to form the variable name. This field is required if *Variable Name Transform* is set to *Replace text in the parameter name using a regular expression*.

Replacement Text
----------------

    The text to use to replace the matched pattern defined in the *Search Pattern* option. If an empty string is supplied the text identified by the pattern is simply removed from the parameter name.

Global Match
------------

    If selected then a global match is performed with the specified pattern. If not selected the replacement stops after the first match.

Case-insensitive Match
----------------------

    If selected a case-insensitive match is performed with the specified pattern.
