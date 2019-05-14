/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra')

const sourceRoot = path(__dirname)
const packageRoot = path.join(sourceRoot, '_package')
const buildRoot = path.join(sourceRoot, '_build')

fs.remove(buildRoot)
fs.remove(packageRoot)