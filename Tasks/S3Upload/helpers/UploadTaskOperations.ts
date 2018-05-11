/*
  * Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
  *
  * Licensed under the MIT License. See the LICENSE accompanying this file
  * for the specific language governing permissions and limitations under
  * the License.
  */

import tl = require('vsts-task-lib/task');
import path = require('path');
import fs = require('fs');
import AWS = require('aws-sdk/global');
import S3 = require('aws-sdk/clients/s3');
import { AWSError } from 'aws-sdk/lib/error';
import { SdkUtils } from 'sdkutils/sdkutils';
import { TaskParameters } from './UploadTaskParameters';

export class TaskOperations {

    public constructor(
        public readonly taskParameters: TaskParameters
    ) {
    }

    public async execute(): Promise<void> {
        await this.createServiceClients();

        if (this.taskParameters.createBucket) {
            await this.createBucketIfNotExist(this.taskParameters.bucketName, this.taskParameters.awsRegion);
        } else {
            const exists = await this.testBucketExists(this.taskParameters.bucketName);
            if (!exists) {
                throw new Error(tl.loc('BucketNotExistNoAutocreate', this.taskParameters.bucketName));
            }
        }

        await this.uploadFiles();
        console.log(tl.loc('TaskCompleted'));
    }

    private s3Client: S3;

    private async createServiceClients(): Promise<void> {

        const s3Opts: S3.ClientConfiguration = {
            apiVersion: '2006-03-01',
            credentials: this.taskParameters.Credentials,
            region: this.taskParameters.awsRegion,
            s3ForcePathStyle: this.taskParameters.forcePathStyleAddressing
        };
        this.s3Client = SdkUtils.createAndConfigureSdkClient(S3, s3Opts, this.taskParameters, tl.debug);
    }

    private async createBucketIfNotExist(bucketName: string, region: string) : Promise<void> {
        const exists = await this.testBucketExists(bucketName);
        if (exists) {
            return;
        }

        try {
            console.log(tl.loc('BucketNotExistCreating', bucketName, region));
            await this.s3Client.createBucket({ Bucket: bucketName }).promise();
            console.log(tl.loc('BucketCreated'));
        } catch (err) {
            console.log(tl.loc('CreateBucketFailure'), err);
            throw err;
        }
    }

    private async testBucketExists(bucketName: string): Promise<boolean> {
        try {
            await this.s3Client.headBucket({ Bucket: bucketName}).promise();
            return true;
        } catch (err) {
            return false;
        }
    }

    private async uploadFiles() {

        let msgTarget: string;
        if (this.taskParameters.targetFolder) {
            msgTarget = this.taskParameters.targetFolder;
        } else {
            msgTarget = '/';
        }
        console.log(tl.loc('UploadingFiles', this.taskParameters.sourceFolder, msgTarget, this.taskParameters.bucketName));

        const matchedFiles = this.findFiles();
        for (let i = 0; i < matchedFiles.length; i++) {
            const matchedFile = matchedFiles[i];
            let relativePath = matchedFile.substring(this.taskParameters.sourceFolder.length);
            if (relativePath.startsWith(path.sep)) {
                relativePath = relativePath.substr(1);
            }
            let targetPath = relativePath;

            if (this.taskParameters.flattenFolders) {
                const flatFileName = path.basename(matchedFile);
                if (this.taskParameters.targetFolder) {
                    targetPath = path.join(this.taskParameters.targetFolder, flatFileName);
                } else {
                    targetPath = flatFileName;
                }
            } else {
                if (this.taskParameters.targetFolder) {
                    targetPath = path.join(this.taskParameters.targetFolder, relativePath);
                } else {
                    targetPath = relativePath;
                }
            }

            const targetDir = path.dirname(targetPath);
            targetPath = targetPath.replace(/\\/g, '/');
            const stats = fs.lstatSync(matchedFile);
            if (!stats.isDirectory()) {
                const fileBuffer = fs.createReadStream(matchedFile);
                try {
                    let contentType: string;
                    if (this.taskParameters.contentType) {
                        contentType = this.taskParameters.contentType;
                    } else {
                        contentType = TaskOperations.knownMimeTypes.get(path.extname(matchedFile));
                        if (!contentType) {
                            contentType = 'application/octet-stream';
                        }
                    }
                    console.log(tl.loc('UploadingFile', matchedFile, contentType));

                    const request: S3.PutObjectRequest = {
                        Bucket: this.taskParameters.bucketName,
                        Key: targetPath,
                        Body: fileBuffer,
                        ACL: this.taskParameters.filesAcl,
                        ContentType: contentType,
                        StorageClass: this.taskParameters.storageClass
                    };
                    switch (this.taskParameters.keyManagement) {
                        case TaskParameters.noKeyManagementValue:
                            break;
                        case TaskParameters.awsKeyManagementValue: {
                            request.ServerSideEncryption = this.taskParameters.encryptionAlgorithm;
                            request.SSEKMSKeyId = this.taskParameters.kmsMasterKeyId;
                        }
                        break;

                        case TaskParameters.customerKeyManagementValue: {
                            request.SSECustomerAlgorithm = this.taskParameters.encryptionAlgorithm;
                            request.SSECustomerKey = this.taskParameters.customerKey;
                        }
                        break;
                    }

                    const response: S3.ManagedUpload.SendData = await this.s3Client.upload(request).promise();
                    console.log(tl.loc('FileUploadCompleted', matchedFile, targetPath));
                } catch (err) {
                    console.error(tl.loc('FileUploadFailed'), err);
                    throw err;
                }
            }
        }
    }

    // known mime types as recognized by the AWS SDK for .NET and
    // AWS Toolkit for Visual Studio
    private static knownMimeTypes: Map<string, string> = new Map<string, string>([
        [ '.ai', 'application/postscript' ],
        [ '.aif', 'audio/x-aiff' ],
        [ '.aifc', 'audio/x-aiff' ],
        [ '.aiff', 'audio/x-aiff' ],
        [ '.asc', 'text/plain' ],
        [ '.au', 'audio/basic' ],
        [ '.avi', 'video/x-msvideo' ],
        [ '.bcpio', 'application/x-bcpio' ],
        [ '.bin', 'application/octet-stream' ],
        [ '.c', 'text/plain' ],
        [ '.cc', 'text/plain' ],
        [ '.ccad', 'application/clariscad' ],
        [ '.cdf', 'application/x-netcdf' ],
        [ '.class', 'application/octet-stream' ],
        [ '.cpio', 'application/x-cpio' ],
        [ '.cpp', 'text/plain' ],
        [ '.cpt', 'application/mac-compactpro' ],
        [ '.cs', 'text/plain' ],
        [ '.csh', 'application/x-csh' ],
        [ '.css', 'text/css' ],
        [ '.dcr', 'application/x-director' ],
        [ '.dir', 'application/x-director' ],
        [ '.dms', 'application/octet-stream' ],
        [ '.doc', 'application/msword' ],
        [ '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ],
        [ '.dot', 'application/msword' ],
        [ '.drw', 'application/drafting' ],
        [ '.dvi', 'application/x-dvi' ],
        [ '.dwg', 'application/acad' ],
        [ '.dxf', 'application/dxf' ],
        [ '.dxr', 'application/x-director' ],
        [ '.eps', 'application/postscript' ],
        [ '.etx', 'text/x-setext' ],
        [ '.exe', 'application/octet-stream' ],
        [ '.ez', 'application/andrew-inset' ],
        [ '.f', 'text/plain' ],
        [ '.f90', 'text/plain' ],
        [ '.fli', 'video/x-fli' ],
        [ '.gif', 'image/gif' ],
        [ '.gtar', 'application/x-gtar' ],
        [ '.gz', 'application/x-gzip' ],
        [ '.h', 'text/plain' ],
        [ '.hdf', 'application/x-hdf' ],
        [ '.hh', 'text/plain' ],
        [ '.hqx', 'application/mac-binhex40' ],
        [ '.htm', 'text/html' ],
        [ '.html', 'text/html' ],
        [ '.ice', 'x-conference/x-cooltalk' ],
        [ '.ief', 'image/ief' ],
        [ '.iges', 'model/iges' ],
        [ '.igs', 'model/iges' ],
        [ '.ips', 'application/x-ipscript' ],
        [ '.ipx', 'application/x-ipix' ],
        [ '.jpe', 'image/jpeg' ],
        [ '.jpeg', 'image/jpeg' ],
        [ '.jpg', 'image/jpeg' ],
        [ '.js', 'application/x-javascript' ],
        [ '.kar', 'audio/midi' ],
        [ '.latex', 'application/x-latex' ],
        [ '.lha', 'application/octet-stream' ],
        [ '.lsp', 'application/x-lisp' ],
        [ '.lzh', 'application/octet-stream' ],
        [ '.m', 'text/plain' ],
        [ '.m3u8', 'application/x-mpegURL' ],
        [ '.man', 'application/x-troff-man' ],
        [ '.me', 'application/x-troff-me' ],
        [ '.mesh', 'model/mesh' ],
        [ '.mid', 'audio/midi' ],
        [ '.midi', 'audio/midi' ],
        [ '.mime', 'www/mime' ],
        [ '.mov', 'video/quicktime' ],
        [ '.movie', 'video/x-sgi-movie' ],
        [ '.mp2', 'audio/mpeg' ],
        [ '.mp3', 'audio/mpeg' ],
        [ '.mpe', 'video/mpeg' ],
        [ '.mpeg', 'video/mpeg' ],
        [ '.mpg', 'video/mpeg' ],
        [ '.mpga', 'audio/mpeg' ],
        [ '.ms', 'application/x-troff-ms' ],
        [ '.msi', 'application/x-ole-storage' ],
        [ '.msh', 'model/mesh' ],
        [ '.nc', 'application/x-netcdf' ],
        [ '.oda', 'application/oda' ],
        [ '.pbm', 'image/x-portable-bitmap' ],
        [ '.pdb', 'chemical/x-pdb' ],
        [ '.pdf', 'application/pdf' ],
        [ '.pgm', 'image/x-portable-graymap' ],
        [ '.pgn', 'application/x-chess-pgn' ],
        [ '.png', 'image/png' ],
        [ '.pnm', 'image/x-portable-anymap' ],
        [ '.pot', 'application/mspowerpoint' ],
        [ '.ppm', 'image/x-portable-pixmap' ],
        [ '.pps', 'application/mspowerpoint' ],
        [ '.ppt', 'application/mspowerpoint' ],
        [ '.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ],
        [ '.ppz', 'application/mspowerpoint' ],
        [ '.pre', 'application/x-freelance' ],
        [ '.prt', 'application/pro_eng' ],
        [ '.ps', 'application/postscript' ],
        [ '.qt', 'video/quicktime' ],
        [ '.ra', 'audio/x-realaudio' ],
        [ '.ram', 'audio/x-pn-realaudio' ],
        [ '.ras', 'image/cmu-raster' ],
        [ '.rgb', 'image/x-rgb' ],
        [ '.rm', 'audio/x-pn-realaudio' ],
        [ '.roff', 'application/x-troff' ],
        [ '.rpm', 'audio/x-pn-realaudio-plugin' ],
        [ '.rtf', 'text/rtf' ],
        [ '.rtx', 'text/richtext' ],
        [ '.scm', 'application/x-lotusscreencam' ],
        [ '.set', 'application/set' ],
        [ '.sgm', 'text/sgml' ],
        [ '.sgml', 'text/sgml' ],
        [ '.sh', 'application/x-sh' ],
        [ '.shar', 'application/x-shar' ],
        [ '.silo', 'model/mesh' ],
        [ '.sit', 'application/x-stuffit' ],
        [ '.skd', 'application/x-koan' ],
        [ '.skm', 'application/x-koan' ],
        [ '.skp', 'application/x-koan' ],
        [ '.skt', 'application/x-koan' ],
        [ '.smi', 'application/smil' ],
        [ '.smil', 'application/smil' ],
        [ '.snd', 'audio/basic' ],
        [ '.sol', 'application/solids' ],
        [ '.spl', 'application/x-futuresplash' ],
        [ '.src', 'application/x-wais-source' ],
        [ '.step', 'application/STEP' ],
        [ '.stl', 'application/SLA' ],
        [ '.stp', 'application/STEP' ],
        [ '.sv4cpio', 'application/x-sv4cpio' ],
        [ '.sv4crc', 'application/x-sv4crc' ],
        [ '.svg', 'image/svg+xml' ],
        [ '.swf', 'application/x-shockwave-flash' ],
        [ '.t', 'application/x-troff' ],
        [ '.tar', 'application/x-tar' ],
        [ '.tcl', 'application/x-tcl' ],
        [ '.tex', 'application/x-tex' ],
        [ '.tif', 'image/tiff' ],
        [ '.tiff', 'image/tiff' ],
        [ '.tr', 'application/x-troff' ],
        [ '.ts', 'video/MP2T' ],
        [ '.tsi', 'audio/TSP-audio' ],
        [ '.tsp', 'application/dsptype' ],
        [ '.tsv', 'text/tab-separated-values' ],
        [ '.txt', 'text/plain' ],
        [ '.unv', 'application/i-deas' ],
        [ '.ustar', 'application/x-ustar' ],
        [ '.vcd', 'application/x-cdlink' ],
        [ '.vda', 'application/vda' ],
        [ '.vrml', 'model/vrml' ],
        [ '.wav', 'audio/x-wav' ],
        [ '.wrl', 'model/vrml' ],
        [ '.xbm', 'image/x-xbitmap' ],
        [ '.xlc', 'application/vnd.ms-excel' ],
        [ '.xll', 'application/vnd.ms-excel' ],
        [ '.xlm', 'application/vnd.ms-excel' ],
        [ '.xls', 'application/vnd.ms-excel' ],
        [ '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ],
        [ '.xlw', 'application/vnd.ms-excel' ],
        [ '.xml', 'text/xml' ],
        [ '.xpm', 'image/x-xpixmap' ],
        [ '.xwd', 'image/x-xwindowdump' ],
        [ '.xyz', 'chemical/x-pdb' ],
        [ '.zip', 'application/zip' ],
        [ '.m4v', 'video/x-m4v' ],
        [ '.webm', 'video/webm' ],
        [ '.ogv', 'video/ogv' ],
        [ '.xap', 'application/x-silverlight-app' ],
        [ '.mp4', 'video/mp4' ],
        [ '.wmv', 'video/x-ms-wmv' ]
    ]);

    private findFiles(): string[] {
        console.log(`Searching ${this.taskParameters.sourceFolder} for files to upload`);
        this.taskParameters.sourceFolder = path.normalize(this.taskParameters.sourceFolder);
        const allPaths = tl.find(this.taskParameters.sourceFolder); // default find options (follow sym links)
        tl.debug(tl.loc('AllPaths', allPaths));
        const matchedPaths = tl.match(allPaths, this.taskParameters.globExpressions, this.taskParameters.sourceFolder); // default match options
        tl.debug(tl.loc('MatchedPaths', matchedPaths));
        const matchedFiles = matchedPaths.filter((itemPath) => !tl.stats(itemPath).isDirectory()); // filter-out directories
        tl.debug(tl.loc('MatchedFiles', matchedFiles));
        tl.debug(tl.loc('FoundNFiles', matchedFiles.length));
        return matchedFiles;
    }

}
