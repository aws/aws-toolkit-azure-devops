import tl = require('vsts-task-lib/task');

export class CreateOrUpdateStackTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public stackName: string;
    public templateFile: string;
    public templateParametersFile: string;
    public useChangeset: boolean;
    public changesetName: string;
    public description: string;
    public autoExecute: boolean;
    public roleARN: string;
    public notificationARNs: string[];
    public resourceTypes: string[];

    public onFailure: string;
    public outputVariable: string;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.stackName = tl.getInput('stackName', true);

            this.templateFile = tl.getPathInput('templateFile', true, true);
            this.templateParametersFile = tl.getPathInput('templateParametersFile', false, true);

            this.useChangeset = tl.getBoolInput('useChangeset', false);
            this.changesetName = tl.getInput('changesetName', this.useChangeset);
            this.description = tl.getInput('description', false);
            this.autoExecute = tl.getBoolInput('autoExecute', false);

            this.roleARN = tl.getInput('roleARN', false);
            this.notificationARNs = tl.getDelimitedInput('notificationARNs', '\n', false);
            this.resourceTypes = tl.getDelimitedInput('resourceTypes', '\n', false);

            this.onFailure = tl.getInput('onFailure');
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
