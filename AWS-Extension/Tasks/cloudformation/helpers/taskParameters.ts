import tl = require("vsts-task-lib/task");

export class AwsCloudFormationTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public stackName: string;
    public awsRegion: string;
    public action: string;
    public location: string;
    public cfTemplateFile: string;
    public cfParametersFile: string;
    public templateLocation: string;
    public cfTemplateUrl: string;
    public cfParametersFileUrl: string;
    public onFailure: string;

    constructor() {
        try {
            const awsEndpoint = tl.getInput("AWSConnection", true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.stackName = tl.getInput("stackname", true);
            this.awsRegion = tl.getInput("regionName", true);
            this.onFailure = tl.getInput("onfailure");
            this.action = tl.getInput("action");
            this.templateLocation = tl.getInput("templateLocation");
            if (this.templateLocation === "Linked artifact") {
                this.cfTemplateFile = tl.getPathInput("cfFile");
                this.cfParametersFile = tl.getPathInput("cfParametersFile");
            } else {
                this.cfTemplateUrl = tl.getInput("cfFileLink");
                this.cfParametersFileUrl = tl.getInput("cfParametersFileLink");
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
