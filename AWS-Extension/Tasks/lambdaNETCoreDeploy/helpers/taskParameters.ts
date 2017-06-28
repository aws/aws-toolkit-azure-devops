import tl = require('vsts-task-lib/task');

export class AwsLambdaNETCoreDeployTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public lambdaProjectPath: string;
    public functionName: string;
    public functionRole: string;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.lambdaProjectPath = tl.getInput('lambdaProjectPath', true);
            this.functionName = tl.getInput('functionName', true);
            this.functionRole = tl.getInput('functionRole', true);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
