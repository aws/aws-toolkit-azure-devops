import tl = require('vsts-task-lib/task');

export class AwsCliTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public awsCliCommand: string;
    public awsCliSubCommand: string;
    public awsCliParameters: string;
    public failOnStandardError: boolean;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.awsCliCommand = tl.getInput('awsCommand', true);
            this.awsCliSubCommand = tl.getInput('awsSubCommand', true);
            this.awsCliParameters = tl.getInput('awsArguments', false);
            this.failOnStandardError = tl.getBoolInput('failOnStandardError');
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
