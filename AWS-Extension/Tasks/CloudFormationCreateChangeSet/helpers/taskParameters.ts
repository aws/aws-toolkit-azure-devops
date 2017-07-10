import tl = require('vsts-task-lib/task');

export class CreateChangeSetTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public changeSetName: string;
    public changeSetType: string;
    public stackName: string;
    public roleARN: string;
    public description: string;
    public cfTemplateFile: string;
    public cfParametersFile: string;
    public templateLocation: string;
    public cfTemplateUrl: string;
    public cfParametersFileUrl: string;
    public notificationARNs: string[];
    public resourceTypes: string[];

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
            this.roleARN = tl.getInput('roleARN', false);
            this.description = tl.getInput('description', false);

            this.templateLocation = tl.getInput('templateLocation');
            if (this.templateLocation === 'LinkedArtifact') {
                this.cfTemplateFile = tl.getPathInput('cfFile');
                this.cfParametersFile = tl.getPathInput('cfParametersFile');
            } else if (this.templateLocation === 'FileURL') {
                this.cfTemplateUrl = tl.getInput('cfFileLink');
                this.cfParametersFileUrl = tl.getInput('cfParametersFileLink');
            }

            this.notificationARNs = tl.getDelimitedInput('notificationARNs', '\n', false);
            this.resourceTypes = tl.getDelimitedInput('resourceTypes', '\n', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
