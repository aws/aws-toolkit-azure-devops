import tl = require('vsts-task-lib/task');

export class DeployTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public applicationName: string;
    public description: string;
    public sourceBundle: string;
    public bucketName: string;
    public targetBundle: string;
    public deploymentGroupName: string;
    public fileExistsBehavior: string;
    public updateOutdatedInstancesOnly: boolean;
    public ignoreApplicationStopFailures: boolean;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.applicationName = tl.getInput('applicationName', true);
            this.description = tl.getInput('description', false);
            this.sourceBundle = tl.getPathInput('sourceBundle', true, true);
            this.bucketName = tl.getInput('bucketName', true);
            this.targetBundle = tl.getInput('targetBundle', true);
            this.deploymentGroupName = tl.getInput('deploymentGroupName', true);
            this.fileExistsBehavior = tl.getInput('fileExistsBehavior', false);
            this.updateOutdatedInstancesOnly = tl.getBoolInput('updateOutdatedInstancesOnly', false);
            this.ignoreApplicationStopFailures = tl.getBoolInput('ignoreApplicationStopFailures', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
