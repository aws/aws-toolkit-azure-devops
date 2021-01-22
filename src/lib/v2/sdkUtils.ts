/*!
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as tl from 'azure-pipelines-task-lib'
import * as path from 'path'

export function setup(): void {
    const taskManifestFile = path.join(__dirname, 'task.json')
    tl.setResourcePath(taskManifestFile)
    setSdkUserAgentFromManifest(taskManifestFile)
}

// Injects a custom user agent conveying extension version and task being run into the
// sdk so usage metrics can be tied to the tools.
function setSdkUserAgentFromManifest(taskManifestFilePath: string): void {
    // TODO
}
