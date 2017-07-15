import tl = require('vsts-task-lib/task');

export class DeployTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public applicationName: string;
    public environmentName: string;
    public webDeploymentAchive: string;


    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.webDeploymentAchive = tl.getInput('webDeploymentAchive', true);
            this.applicationName = tl.getInput('applicationName', true);
            this.environmentName = tl.getInput('environmentName', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
