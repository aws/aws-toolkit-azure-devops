/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import * as scriptUtils from './scriptUtils'

fs.removeSync(scriptUtils.buildRoot)
fs.removeSync(scriptUtils.packageRoot)

fs.readdirSync(scriptUtils.sourceTasks).forEach(taskName => {
    try {
        fs.removeSync(path.join(scriptUtils.sourceTasks, taskName, `${taskName}.runner.ts`))
    } catch (e) {}
})
