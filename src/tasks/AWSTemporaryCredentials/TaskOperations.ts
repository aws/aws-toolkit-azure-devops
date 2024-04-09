/*!
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT
 */

import sts = require('@aws-sdk/client-sts')
import tl = require('azure-pipelines-task-lib/task')
import { TaskParameters } from './TaskParameters'
import { getHandlerFromToken, WebApi } from 'azure-devops-node-api'
import { ITaskApi } from 'azure-devops-node-api/TaskApi'

export class TaskOperations {
    public constructor(public readonly taskParameters: TaskParameters) {}

    public async execute(): Promise<void> {
        console.log(tl.loc('GettingOIDCToken'))
        const idToken = await this.getOIDCToken(this.taskParameters.connectedServiceNameARM)
        if (idToken == undefined) {
            throw new Error('Failed to get a Token from the connection ${this.taskParameters.connectedServiceNameARM}')
        }

        console.log(tl.loc('GettingTemporarySTS'))
        const sessionName = this.buildSessionName()

        const params: sts.AssumeRoleWithWebIdentityCommandInput = {
            RoleArn: this.taskParameters.assumeRole,
            RoleSessionName: sessionName,
            WebIdentityToken: idToken
        }
        const client = new sts.STSClient({ region: this.taskParameters.regionName })

        const command = new sts.AssumeRoleWithWebIdentityCommand(params)
        const response = await client.send(command)

        const accessKey = response.Credentials?.AccessKeyId || ''
        const secretAccessKey = response.Credentials?.SecretAccessKey || ''
        const sessionToken = response.Credentials?.SessionToken || ''
        console.log(tl.loc('GotTemporarySTS'))

        const prefix = this.taskParameters.varPrefix
        console.log(tl.loc('ExportingSTS', prefix))
        tl.setVariable(prefix.concat('ACCESS_KEY_ID'), accessKey)
        tl.setVariable(prefix.concat('SECRET_ACCESS_KEY'), secretAccessKey)
        tl.setVariable(prefix.concat('SESSION_TOKEN'), sessionToken)

        tl.setSecret(secretAccessKey)

        console.log(tl.loc('TaskCompleted'))
    }

    private buildSessionName() {
        let buildId = tl.getVariable('Build.BuildId') || ''
        let pipelineId = tl.getVariable('System.DefinitionId') || ''
        let projectName = tl.getVariable('System.TeamProject') || ''

        let sessionName = `${projectName}-${pipelineId}-${buildId}`
        if (sessionName.length > 64) {
            buildId = this.trimMiddleString(buildId)
            pipelineId = this.trimMiddleString(pipelineId)
            projectName = this.trimMiddleString(projectName)
            sessionName = `${projectName}/${pipelineId}/${buildId}`
        }
        return sessionName
    }

    private trimMiddleString(text: string, length = 6, padding = '...') {
        const shortText = text.substring(0, length) + padding + text.substring(-length)

        if (shortText.length < text.length) {
            return shortText
        } else {
            return text
        }
    }

    private async getOIDCToken(connectedService: string): Promise<string> {
        const jobId = tl.getVariable('System.JobId') || ''
        const planId = tl.getVariable('System.PlanId') || ''
        const projectId = tl.getVariable('System.TeamProjectId') || ''
        const hub = tl.getVariable('System.HostType') || ''
        const uri = tl.getVariable('System.CollectionUri') || ''
        const token = tl.getVariable('System.AccessToken')

        if (token == undefined) {
            throw new Error('System.AccessToken is undefined')
        }

        const authHandler = getHandlerFromToken(token)
        const connection = new WebApi(uri, authHandler)
        const api: ITaskApi = await connection.getTaskApi()
        const response = await api.createOidcToken({}, projectId, hub, planId, jobId, connectedService)
        if (response == undefined || response.oidcToken == undefined) {
            throw new Error('Impossible to generate OidcToken')
        }
        return response.oidcToken
    }
}
