import * as AWS from 'aws-sdkglobal'
import * as tl from 'azure-pipelines-task-lib'
import * as fs from 'fs'
import { VSTSTaskManifest } from 'lib/vstsUtils'
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
