.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _send-message:

#####################
AWS Send Message Task
#####################

.. meta::
   :description: AWS Tools for Visual Studio Team Services (VSTS) Task Reference
   :keywords: extensions, tasks

Synopsis
========

Sends a message to an |SNSlong| (SNS) topic or to an |SQSlong| (SQS) queue.

Description
===========

This task accepts a message to be sent to an |SNS| topic or to an |SQS| queue. If the message is to be
sent to a queue, you can configure an optional delay (in seconds). If you don't specify a delay,
the task assumes the default delay that is associated with the queue.

Parameters
==========

You can set the following parameters for the task. Required
parameters are noted by an asterisk (*). Other parameters are optional.

Displayname*
------------

    The default name of the task, Send Message. The delivery target, topic or queue, is appended
    to the name.

AWS Credentials*
----------------

    The AWS credentials to use. If needed, choose :guilabel:`+`, and then add a new AWS connection.

AWS Region*
-----------

    The AWS Region name to use. For more information, see :aws-gr:`Regions and Endpoints <rande>` in
    the |AWS-gr|.

Message Target*
---------------

    The target for the message, a topic in |SNS| or an |SQS| queue.

Message
-------

    The message to send. For the allowed values, see the respective service help pages for
    `Publish <https://docs.aws.amazon.com/sns/latest/api/API_Publish.html>`_ and
    `SendMessage <http://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html>`_.

Topic ARN*
----------

    Required parameter only if :code:`Message Target` is set to :guilabel:`SNS Topic`. Supply the Amazon
    Resource Name (ARN) of the topic.

Queue Url*
----------

    Required parameter only if :code:`Message Target` is set to :guilabel:`SQS Queue`. Supply the URL
    of the queue.

Delay (seconds)
---------------

    Available for |SQS| queues only. The length of time, in seconds, to delay a specific message. Valid
    values: 0 to 900. Maximum: 15 minutes. Messages with a positive :code:`DelaySeconds` value become available
    for processing after the delay period is finished. If you don't specify a value, the default value for the queue applies.
