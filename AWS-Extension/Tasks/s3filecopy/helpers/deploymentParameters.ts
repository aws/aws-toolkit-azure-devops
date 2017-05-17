import tl = require("vsts-task-lib/task");

export class S3Parameters {
    public awsKeyId: string;
    public awsSecretKey: string;
    public awsRegion: string;
    public awsBucketName: string;
    public sourceFolder: string;
    public targetFolder: string;
    public flattenFolders: boolean;
    public overwrite: boolean;
    public awsContentPattern: string[];
    public filesAcl: string;
    public creatBucket : boolean;
    //public enableVersioning: boolean;

    constructor() {
        try {
            var awsEndpoint = tl.getInput('AWSConnection', true);
            var awsEndpoint = tl.getInput('AWSConnection', true);
            var awsEndpointAuth = tl.getEndpointAuthorization(awsEndpoint, false);
            this.awsKeyId = awsEndpointAuth['parameters']['username'];
            this.awsSecretKey = awsEndpointAuth['parameters']['password'];
            this.awsRegion = tl.getInput('regionName', true);
            this.awsBucketName = tl.getInput('BucketName', true);
            this.overwrite = tl.getBoolInput('overwrite', false);
            this.flattenFolders = tl.getBoolInput('flattenFolders', false);
            this.sourceFolder = tl.getPathInput('SourceFolder', true, true);
            this.targetFolder = tl.getPathInput('TargetFolder', false);
            this.awsContentPattern = tl.getDelimitedInput('Contents','\n',true);
            this.filesAcl = tl.getInput('filesAcl',false);
            this.creatBucket = tl.getBoolInput('createBucket');
            //this.enableVersioning = tl.getBoolInput('enableVersioning');

        }
        catch (error) {
            throw new Error(error.message);
        }
    }
}