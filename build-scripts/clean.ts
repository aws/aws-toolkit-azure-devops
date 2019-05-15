/*!
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import * as fs from 'fs-extra'
import * as folders from './scriptUtils'

fs.remove(folders.buildRoot)
fs.remove(folders.packageRoot)
