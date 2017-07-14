import tl = require('vsts-task-lib/task');

export class CreateOrUpdateStackTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public stackName: string;
    public awsRegion: string;
    public templateFile: string;
    public templateParametersFile: string;
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
            this.templateParametersFile = tl.getPathInput('templateParametersFile', true, true);
            this.onFailure = tl.getInput('onFailure');
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
