/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'vsts-task-lib/task'

export interface VSTSManifestVersionInfo {
    Major: string
    Minor: string
    Patch: string
}

export interface VSTSTaskManifest {
    name: string
    version: VSTSManifestVersionInfo
}

/**
 * This function is required for strict mode compliance. Although it will not throw
 * errors without it, that is because the vsts-task-lib type annotations are wrong as of
 * version 2.7.0 .
 */
export function getInputRequired(name: string): string {
    const input = tl.getInput(name, true)
    if (!input) {
        throw new Error('Unreachable code, required input returned undefined and did not throw!')
    }

    return input
}

export function getInputOptional(name: string): string | undefined {
    return tl.getInput(name, false)
}

export function getInputOrEmpty(name: string): string {
    return tl.getInput(name, false) || ''
}
