/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as fs from 'fs'
import * as path from 'path'

interface RunnerGenerator {
    taskName: string
    taskClients: string[]
    additionalImports?: string[]
    additionalArguments?: string[]
    successResult?: string
}

const repoRoot = path.dirname(__dirname)
const header = `
/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

/* NOTE! this file is auto-generated by generateRunners.ts, do not edit it by hand or commit it */
`

function generate(
    filename: string,
    clientTypes: string[],
    additionalArguments?: string[],
    additionalImports?: string[],
    successResult?: string
) {
    const importStament = `
import tl = require('vsts-task-lib/task')

import { SdkUtils } from 'Common/sdkutils'

import { ${clientTypes.map(it => 'createDefault' + it).join(', ')} } from 'Common/defaultClients'
import { TaskOperations } from './TaskOperations'
import { buildTaskParameters } from './TaskParameters'${
        additionalImports === undefined ? '' : '\n\n' + additionalImports.join('\n        ')
    }
`

    const runStatement = `
async function run(): Promise<void> {
    SdkUtils.readResources()
    const taskParameters = buildTaskParameters()

    return new TaskOperations(
        ${clientTypes
            .map(it => {
                // tslint:disable-next-line:prefer-template
                return 'await createDefault' + it + '(taskParameters, tl.debug),'
            })
            .join('\n        ')}${
        // tslint:disable-next-line:prefer-template
        additionalArguments === undefined ? '' : '\n        ' + additionalArguments.join(',\n        ') + ','
    }
        taskParameters).execute()
}
`

    const run = `
run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, ${successResult === undefined ? "''" : successResult})
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, \`\${error}\`)
)
`

    const output = header + importStament + runStatement + run
    fs.writeFileSync(`Tasks/${filename}/${filename}.runner.ts`, output)
}

const generateFile = path.join(repoRoot, 'generate.json')
const parsedJson = JSON.parse(fs.readFileSync(generateFile).toString()) as RunnerGenerator[]
for (const json of parsedJson) {
    generate(json.taskName, json.taskClients, json.additionalArguments, json.additionalImports, json.successResult)
}
