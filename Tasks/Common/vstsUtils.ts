/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getInput } from 'azure-pipelines-task-lib/task'

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
 * errors without it, that is because the azure-pipelines-task-lib type annotations are wrong as of
 * version 2.8.0 .
 */
export function getInputRequired(name: string): string {
    const input = getInput(name, true)
    if (!input) {
        throw new Error('Unreachable code, required input returned undefined and did not throw!')
    }

    return input
}

export function getInputOptional(name: string): string | undefined {
    return getInput(name, false)
}

export function getInputOrEmpty(name: string): string {
    return getInput(name, false) || ''
}

export async function sleep(timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, timeoutMs)
    })
}
