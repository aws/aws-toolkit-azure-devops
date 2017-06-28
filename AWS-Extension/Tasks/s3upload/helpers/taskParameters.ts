import tl = require('vsts-task-lib/task');

export class UploadTaskParameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public bucketName: string;
    public sourceFolder: string;
    public targetFolder: string;
    public flattenFolders: boolean;
    public overwrite: boolean;
    public globExpressions: string[];
    public filesAcl: string;
    public createBucket: boolean;

    constructor() {
        try {
            const awsEndpoint = tl.getInput('awsCredentials', true);
            const awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth.parameters.username;
            this.awsSecretKey = awsEndpointAuth.parameters.password;
            this.awsRegion = tl.getInput('regionName', true);
            this.bucketName = tl.getInput('bucketName', true);
            this.overwrite = tl.getBoolInput('overwrite', false);
            this.flattenFolders = tl.getBoolInput('flattenFolders', false);
            this.sourceFolder = tl.getPathInput('sourceFolder', true, true);
            this.targetFolder = tl.getPathInput('targetFolder', false);
            this.globExpressions = tl.getDelimitedInput('globExpressions', '\n', true);
            this.filesAcl = tl.getInput('filesAcl', false);
            this.createBucket = tl.getBoolInput('createBucket');
        } catch (error) {
            throw new Error(error.message);
        }
    }
}
