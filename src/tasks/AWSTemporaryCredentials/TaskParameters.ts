/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib/task'
import { getInputOptional, getInputOrEmpty, getInputRequired } from 'lib/vstsUtils'

export interface TaskParameters {
    connectedServiceNameARM: string
    regionName: string
    assumeRole: string
    varPrefix: string
    failOnStandardError: boolean
}

export function buildTaskParameters(): TaskParameters {
    const parameters: TaskParameters = {
        connectedServiceNameARM: getInputRequired('connectedServiceNameARM'),
        regionName: getInputRequired('regionName'),
        assumeRole: getInputRequired('assumeRole'),
        varPrefix: getInputRequired('varPrefix'),
        failOnStandardError: tl.getBoolInput('failOnStandardError')
    }

    return parameters
}
