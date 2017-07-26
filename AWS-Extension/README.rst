.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

###################
aws-vsts-extensions
###################

This repository contains source content for the official `AWS Tools for Microsoft Visual Studio Team Services`_. The source
code for the `AWS Tools for Microsoft Visual Studio Team Services`_ is also on GitHub, at https://github.com/awslabs/aws-vsts-extensions/.

The guide content is written in reStructuredText_ and built using Sphinx_. It relies upon content
which is provided in the AWS documentation team's `shared content`_ and `SDK examples`_
repositories.


Reporting issues
================

You can use the Issues_ section of this repository to report problems in the documentation. *When
submitting an issue, please indicate*:

* what page (a URL or filename is best) the issue occurs on.

* what the issue is, using as much detail as you can provide. For many issues, this might be as
  simple as "The page has a typo; the word 'complie' in the third paragraph shoud be 'compile'." If
  the issue is more complex, please describe it with enough detail that it's clear to the AWS
  documentation team what the problem is.


Contributing fixes and updates
==============================

To contribute your own documentation fixes or updates, please use the Github-standard procedures for
`forking the repository`_ and submitting a `pull request`_.

Note that many common substitutions_ and extlinks_ found in these docs are sourced from the `shared
content`_ repository--if you see a substitution used that is not declared at the top of the source
file or in the ``_includes.txt`` file, then it is probably defined in the shared content.


Building the documentation
--------------------------

If you are planning to contribute to the docs, you should build your changes and review them before
submitting your pull request.

**To build the docs:**

1. Make sure that you have downloaded and installed Sphinx_.
2. Run the ``build_docs.py`` script in the repository's root directory.

   ``build_docs.py`` can take any of the `available Sphinx builders`_ as its argument. For example,
   to build the docs into a single HTML page, you can use the ``singlehtml`` target, like so::

     python build_docs.py singlehtml

The build process will automatically download a snapshot of its dependencies, combine them in the
``doc_build`` directory and will then generate output into the ``doc_output`` directory.


Code examples in the documentation
----------------------------------

The code examples featured in this documentation can be found in a separate repository:
`aws-doc-sdk-examples <https://github.com/awsdocs/aws-doc-sdk-examples/tree/master/java>`_. Full
code and build files are included, so you can build and run any of the provided examples yourself.

In addition to examples in Java, you'll also find examples for each of the other AWS SDKs. If you
find issues with any of the examples, you can submit issues or fork the repository and submit a pull
request!

The code examples are provided under the *Apache 2.0* open source license. See the example
repository's `README <https://github.com/awsdocs/aws-doc-sdk-examples/blob/master/README.rst>`_ for
more details.


Copyright and license
=====================

All content in this repository, unless otherwise stated, is Copyright © 2010-2017, Amazon Web
Services, Inc. or its affiliates. All rights reserved.

Except where otherwise noted, this work is licensed under a `Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 International License
<http://creativecommons.org/licenses/by-nc-sa/4.0/>`_ (the "License"). Use the preceding link for a
human-readable summary of the license terms. The full license text is available at:
http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode and in the LICENSE file accompanying this
repository.

.. =================================================================================
.. Links used in the README. For sanity's sake, keep this list sorted alphabetically
.. =================================================================================

.. _`available sphinx builders`: http://www.sphinx-doc.org/en/stable/builders.html
.. _`aws java developer guide`: http://docs.aws.amazon.com/sdk-for-java/v2/developer-guide/welcome.html
.. _`aws sdk for java`: https://aws.amazon.com/sdk-for-java/
.. _`forking the repository`: https://help.github.com/articles/fork-a-repo/
.. _`pull request`: https://help.github.com/articles/using-pull-requests/
.. _`shared content`: https://github.com/awsdocs/aws-doc-shared-content
.. _`sdk examples`: https://github.com/awsdocs/aws-doc-sdk-examples
.. _extlinks: http://www.sphinx-doc.org/en/stable/ext/extlinks.html
.. _issues: https://github.com/awsdocs/aws-java-developer-guide/issues
.. _restructuredtext: http://docutils.sourceforge.net/rst.html
.. _sphinx: http://www.sphinx-doc.org/en/stable/
.. _substitutions: http://www.sphinx-doc.org/en/stable/rest.html#substitutions
