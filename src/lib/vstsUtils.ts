/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import { getInput, getPathInput, getVariable, warning } from 'azure-pipelines-task-lib/task'
import * as azdev from "azure-devops-node-api"
import * as semver from 'semver'

export interface VSTSManifestVersionInfo {
    Major: string
    Minor: string
    Patch: string
}

export interface VSTSTaskManifest {
    name: string
    version: VSTSManifestVersionInfo
}

export function warnIfBuildAgentTooLow(): boolean {
    const version = getVariable('agent.version') ?? '0.0.0'

    if (semver.lt(version, '2.144.0')) {
        warning(`The build agent version you are using ${version} is no longer supported`)
        warning('by Microsoft. Future versions of the AWS Toolkit for Azure DevOps will')
        warning('require an agent version of 2.144.0 or newer!')
        warning(
            'See the Azure DevOps documentation for how to upgrade: https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/agents?view=azure-devops&tabs=browser#agent-version-and-upgrades'
        )

        return true
    }

    return false
}

/**
 * This function is required for strict mode compliance. Although it will not throw
 * errors without it, that is because the azure-pipelines-task-lib type annotations are wrong as of
 * version 2.8.0 .
 */
export function getInputRequired(name: string): string {
    const input = getInput(name, true)
    if (!input) {
        throw new Error('Unreachable code, required input returned undefined and did not throw!')
    }

    return input
}

export function getInputOptional(name: string): string | undefined {
    return getInput(name, false)
}

export function getInputOrEmpty(name: string): string {
    return getInput(name, false) || ''
}

export function getPathInputRequired(name: string): string {
    const input = getPathInput(name, true, false)
    if (!input) {
        throw new Error('unreachable code, required input returned undefined and did not throw!')
    }

    return input
}

export function getPathInputRequiredCheck(name: string): string {
    const input = getPathInput(name, true, true)
    if (!input) {
        throw new Error('unreachable code, required input returned undefined and did not throw!')
    }

    return input
}

export function getVariableRequired(name: string): string {
    const variable = getVariable(name)
    if (!variable) {
        throw new Error(`Unreachable code, required variable '${name}' returned undefined!`)
    }

    return variable
}

export async function getOidcTokenForEndpoint(endpoint_name: string): Promise<string> {
    const jobId = getVariableRequired("System.JobId");
    const planId = getVariableRequired("System.PlanId");
    const projectId = getVariableRequired("System.TeamProjectId");
    const hub = getVariableRequired("System.HostType");
    const uri = getVariableRequired("System.CollectionUri");
    const token = getVariableRequired("System.AccessToken");

    const auth = azdev.getBasicHandler('', token);
    const connection = new azdev.WebApi(uri, auth);
    const api = await connection.getTaskApi();
    const response = await api.createOidcToken({}, projectId, hub, planId, jobId, endpoint_name);
    if (!response.oidcToken) {
        throw new Error('Invalid createOidcToken response, no oidcToken.');
    }
    return response.oidcToken;
}
