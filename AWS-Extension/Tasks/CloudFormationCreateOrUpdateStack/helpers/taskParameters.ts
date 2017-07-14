import tl = require('vsts-task-lib/task');

export class CreateOrUpdateStackTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public stackName: string;
    public awsRegion: string;
    public cfTemplateFile: string;
    public cfParametersFile: string;
    public templateLocation: string;
    public cfTemplateUrl: string;
    public cfParametersFileUrl: string;
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
            this.onFailure = tl.getInput('onFailure');

            this.templateLocation = tl.getInput('templateLocation');
            if (this.templateLocation === 'LinkedArtifact') {
                this.cfTemplateFile = tl.getPathInput('cfFile');
                this.cfParametersFile = tl.getPathInput('cfParametersFile');
            } else {
                this.cfTemplateUrl = tl.getInput('cfFileLink');
                this.cfParametersFileUrl = tl.getInput('cfParametersFileLink');
            }

            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
