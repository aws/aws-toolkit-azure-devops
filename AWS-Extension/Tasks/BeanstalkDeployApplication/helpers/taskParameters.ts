import tl = require('vsts-task-lib/task');

export class DeployTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public applicationName: string;
    public environmentName: string;
    public webDeploymentArchive: string;
    public applicationType: string;
    public dotnetPublishPath: string;

    public readonly applicationTypeAspNet = "aspnet";
    public readonly applicationTypeAspNetCoreForWindows = "aspnetCoreWindows";

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);

            this.applicationType = tl.getInput('applicationType', true);
            console.log(tl.loc('DisplayApplicationType', this.applicationType));

            if(this.applicationType == this.applicationTypeAspNetCoreForWindows) {
                this.dotnetPublishPath = tl.getPathInput('dotnetPublishPath', true);
            }
            else {
                this.webDeploymentArchive = tl.getPathInput('webDeploymentArchive', true);
            }



            this.applicationName = tl.getInput('applicationName', true);
            this.environmentName = tl.getInput('environmentName', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
