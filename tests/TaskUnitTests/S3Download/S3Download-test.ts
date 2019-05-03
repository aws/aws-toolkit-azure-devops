import { TaskOperations } from '../../../Tasks/S3Download/DownloadTaskOperations';
import { TaskParameters } from '../../../Tasks/S3Download/DownloadTaskParameters';

test('Creates a TaskOperation', () => {
    const taskParameters = new TaskParameters();
    expect(new TaskOperations(null, taskParameters)).not.toBeNull();
});
