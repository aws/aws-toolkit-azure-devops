.. Copyright 2010-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

   This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0
   International License (the "License"). You may not use this file except in compliance with the
   License. A copy of the License is located at http://creativecommons.org/licenses/by-nc-sa/4.0/.

   This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
   either express or implied. See the License for the specific language governing permissions and
   limitations under the License.

.. _send-message:

################
AWS Send Message
################

.. meta::
   :description: AWS Tools for Microsoft Visual Studio Team Services Task Reference
   :keywords: extensions, tasks

Synopsis
========

Sends a message to a |SNSlong| (SNS) topic or a |SQSlong| (SQS) queue.

Description
===========

This task accepts a message to be sent to either a |SNS| topic or a |SQS| queue. If the message is to be sent to
a queue an optional delay (in seconds) can be configured. If no delay is specified the default associated with the queue
is assumed.

Parameters
==========

The following is the list of parameters available for you to set for the task. The required parameters
are noted by an '*', the others are optional.

Displayname*
------------

    By default the name of the task, Send Message. The delivery target, topic or queue, is appended to the name.

AWS Credentials*
----------------
    
    Select the AWS credentials to use. If needed, click on +, and add a new AWS connection.

AWS Region*
-----------
    
    AWS region name, for more information, see :aws-gr:`Regions and Endpoints <rande>` in |AWS-gr|. 

Message Target*
---------------

    Select the target for the message, a topic in |SNS| or a |SQS| queue.

Message
-------

    The message to be sent. For the permissable values see the respective service help pages for
    `Publish <https://docs.aws.amazon.com/sns/latest/api/API_Publish.html>`_ and
    `SendMessage <http://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessage.html>`_.

Topic ARN*
----------

    This is a required parameter only if Message Target is set to 'SNS Topic'. Supply the Amazon Resource Name (ARN) of the topic.

Queue Url*
----------

    This is a required parameter only if Message Target is set to 'SQS Queue'. Supply the url of the queue.

Delay (seconds)
---------------

    Available for |SQSlong| queues only. The length of time, in seconds, for which to delay a specific message. Valid
    values: 0 to 900. Maximum: 15 minutes. Messages with a positive DelaySeconds value become available for processing
    after the delay period is finished. If you don't specify a value, the default value for the queue applies.
