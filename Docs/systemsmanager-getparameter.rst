.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _systemsmanager-getparameter:

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

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.

Displayname*
------------

    The default name of the task, AWS Systems Manager Get Parameter. You can rename it or append the name of the
    associated Parameter Store parameter or parameter path to it.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in the
    |AWS-gr|.

Read Mode*
----------

    Sets the mode of operation. Choose from reading a single parameter value identified by name, or a hierarchy of
    parameter values identified by common path.

Parameter Name
--------------

    Required if Read Mode is set to get a single parameter value. Identifies the name of the parameter to read.

Parameter Path
--------------

    Required if Read Mode is set to parameter hierarchy. Identifies the path of the parameter(s) to be read.

Recursive
---------

    Available when reading a parameter hierarchy. If checked, values for the specified Parameter Path and all
    sub-paths are read. If unchecked only the values for parameters matching the supplied path are read, values
    in sub-paths are ignored.

Variable Name Transform
-----------------------

    Specifies how the build variable name(s) to hold the parameter value(s) are created. You can choose from

    - Use parameter names (including any paths) as variable names. The full parameter name is used to set the build
      variable name.
    - Use leaf of parameter names as variable names. The path is removed and the resulting leaf text used as the
      build variable name.
    - Replace text in the parameter name using a regular expression. Replace text in the parameter name to form the
      build variable name.
    - Use custom name. Available for single parameter read mode only, enables entry of a custom name for the build variable.

Custom Variable Name
--------------------

    Required of Variable Name Transform is set to 'use custom name'. Specifies the desired name for the build variable.

Search Pattern
--------------

    Required if Variable Name Transform is set to 'replace text'. Specifies the search pattern as a regular expression.

Replacement Text
----------------

    Specifies the replacement text pattern when Variable Name Transform is set to 'replace text'.

Global Match
------------

    When replacing text specifies if the replacement stops at the first match or replaces all occurrences of the
    search pattern.

Case-insensitive Match
----------------------

    When replacing text specifies if the search should be done in a case-insensitive manner.
