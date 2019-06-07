/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

export interface VSTSManifestVersionInfo {
    Major: string
    Minor: string
    Patch: string
}

export interface VSTSTaskManifest {
    name: string
    version: VSTSManifestVersionInfo
}
