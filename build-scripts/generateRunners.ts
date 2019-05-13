/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as fs from 'fs'
import * as path from 'path'

const repoRoot = path.dirname(__dirname)

const header =
`
/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

/* NOTE! this file is auto-generated by generateRunners.ts */
`

function generate(filename: string, clientType: string, setResult?: string) {
    const runStatement =
`
async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()
    const client = await createDefault${clientType}(taskParameters, tl.debug)

    return new TaskOperations(client, taskParameters).execute()
}
`

    const importStament =
`
import tl = require('vsts-task-lib/task')

import { SdkUtils } from 'Common/sdkutils'

import { createDefault${clientType} } from 'Common/defaultClients'
import { TaskOperations } from './TaskOperations'
import { buildTaskParameters } from './TaskParameters'
`

    const run =
`
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, ${setResult === undefined ? "''" : setResult})
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, \`\${error}\`)
)
`

    const output = header + importStament + runStatement + run
    fs.writeFileSync(`Tasks/${filename}/${filename}.ts`, output)
}

const generateFile = path.join(repoRoot, 'generate.json')
const parsedJson = JSON.parse(fs.readFileSync(generateFile).toString()) as any[]
for (const json of parsedJson) {
    generate(json.TaskName, json.TaskClient, json.SetResult)
}
