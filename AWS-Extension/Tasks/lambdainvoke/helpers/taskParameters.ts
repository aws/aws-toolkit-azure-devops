import tl = require('vsts-task-lib/task');

export class AwsLambdaInvokeTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public functionName: string;
    public payload: string;
    public invocationType: string;
    public logType: string;
    public outputVariable: string;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.functionName = tl.getInput('functionName', true);
            this.payload = tl.getInput('payload', false);
            this.invocationType = tl.getInput('invocationType', false);
            this.logType = tl.getInput('logType', false);
            this.outputVariable = tl.getInput('outputVariable', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
