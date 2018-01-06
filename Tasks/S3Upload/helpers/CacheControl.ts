/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import im = require('vsts-task-lib/internal');

export class CacheControl {
    private glob: string;
    private regex: RegExp;
    private config: string;

    constructor(c: string) {
        const kvp = c.split('=');
        this.glob = kvp[0].trim();
        this.config = kvp[1].trim();
        this.regex = im._legacyFindFiles_convertPatternToRegExp(this.glob);
        console.log(tl.loc('AddingCacheControl', this.glob, this.config));
    }
}
