import { TaskOperations } from '../../../Tasks/S3Download/DownloadTaskOperations';
import { TaskParameters } from '../../../Tasks/S3Download/DownloadTaskParameters';
import { SdkUtils } from '../../../Tasks/Common/sdkutils/sdkutils';
import path = require('path');
const AWS = require('aws-sdk');

describe('S3 Download', () => {
    beforeAll(() => {
        ;
    });

    test('Creates a TaskOperation', () => {
        const taskParameters = new TaskParameters();
        expect(new TaskOperations(null, taskParameters)).not.toBeNull();
    });

    test('Handles not being able to connect to a bucket', async () => {
        SdkUtils.readResourcesFromRelativePath('../../../Tasks/S3Download/task.json');
        const s3 = new AWS.S3({region: 'us-east-1'});
        s3.headBucket = jest.fn((params, cb) => {throw new Error('doesn\'t exist dummy'); });
        const taskParameters = new TaskParameters();
        const taskOperation = new TaskOperations(s3, taskParameters);
        //expect.assertions(1);
        await taskOperation.execute().catch((e) => { console.log(e);/* expect(e).toContain('BucketNotExist');*/ });
    });
});
