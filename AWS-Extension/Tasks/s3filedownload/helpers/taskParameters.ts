import tl = require('vsts-task-lib/task');

export class AwsS3FileDownloadTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public bucketName: string;
    public sourceFolder: string;
    public targetFolder: string;
    public globExpressions: string[];
    public overwrite: boolean;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsConnection', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.bucketName = tl.getInput('bucketName', true);
            this.sourceFolder = tl.getPathInput('sourceFolder', false);
            this.targetFolder = tl.getPathInput('targetFolder', true, true);
            this.globExpressions = tl.getDelimitedInput('globExpressions', '\n', true);
            this.overwrite = tl.getBoolInput('overwrite', false);
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
