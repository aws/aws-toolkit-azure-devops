import { TaskParameters } from '../../../Tasks/S3Download/DownloadTaskParameters';
import { TaskOperations } from '../../../Tasks/S3Download/DownloadTaskOperations';

test('Creates a TaskOperation', () => {
    const taskParameters = new TaskParameters();
    expect(new TaskOperations(taskParameters, null)).not.toBeNull();
});
