import tl = require('vsts-task-lib/task');

export class CreateChangeSetTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public changeSetName: string;
    public changeSetType: string;
    public stackName: string;
    public autoExecute: boolean;
    public roleARN: string;
    public description: string;
    public templateSource: string;
    public templateFile: string;
    public templateParametersFile: string;
    public notificationARNs: string[];
    public resourceTypes: string[];
    public outputVariable: string;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);

            this.changeSetName = tl.getInput('changeSetName', true);
            this.changeSetType = tl.getInput('changeSetType', true);
            this.stackName = tl.getInput('stackName', true);
            this.description = tl.getInput('description', false);
            this.autoExecute = tl.getBoolInput('autoExecute', true);

            this.templateSource = tl.getInput('templateSource', true);
            if (this.templateSource === 'NewTemplate') {
                this.templateFile = tl.getPathInput('templateFile', true, true);
                this.templateParametersFile = tl.getPathInput('templateParametersFile', true, true);
            }

            this.roleARN = tl.getInput('roleARN', false);
            this.notificationARNs = tl.getDelimitedInput('notificationARNs', '\n', false);
            this.resourceTypes = tl.getDelimitedInput('resourceTypes', '\n', false);

            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
