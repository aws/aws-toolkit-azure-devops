/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as fs from 'fs'
import * as path from 'path'

const tasksPath = path.join(__dirname, '../src/tasks') // Path to task entries
const recordsPath = './taskInputs.gen.ts' // Path where we track tasks inputs to ensure they don't differ with changes

function validateTaskInputNotChanged() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const recordsJson = require(recordsPath).records

    const taskFiles = fs
        .readdirSync(tasksPath, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => path.join(tasksPath, e.name, 'task.json'))

    const errors: string[] = []
    for (const taskFile of taskFiles) {
        const taskJson = JSON.parse(fs.readFileSync(taskFile, 'utf8'))
        const actualTaskInputs = new Set(taskJson.inputs.map((i: any) => i.name))
        const expectedTaskInputs: string[] = recordsJson[taskJson.name]

        for (const t of expectedTaskInputs) {
            if (!actualTaskInputs.has(t)) {
                errors.push(`    - ${taskJson.name}/task.json: '${t}'`)
            }
        }
    }

    if (errors.length > 0) {
        return (
            'WARNING: Task inputs have changed. This is a non-backwards-compatible change and may break users with pipelines that define the removed inputs.\n' +
            'Please ensure this change is intentional. You should consider a migration strategy, such as adding a new parameter only and reading both, with the new parameter overriding the old one. You can also add *Deprecated* to the display title or make it invisible.\n' +
            `Missing expected task inputs:\n\n${errors.join('\n')}\n\n` +
            'If this is intentional and migration steps are in place, please update tests/resources/taskInputs.gen.json'
        )
    }

    return undefined
}

function main() {
    const validations = [validateTaskInputNotChanged]

    for (const v of validations) {
        const result = v()
        if (result) {
            console.log(result)
            process.exit(1)
        }
    }

    console.log('All validations passed!')
}

main()
