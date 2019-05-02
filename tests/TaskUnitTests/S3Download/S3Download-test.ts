import { TaskOperations } from '../../../Tasks/S3Download/helpers/DownloadTaskOperations';
import { TaskParameters } from '../../../Tasks/S3Download/helpers/DownloadTaskParameters';

test('Creates a TaskOperation', () => {
    const taskParameters = new TaskParameters();
    expect(() => new TaskOperations(taskParameters).execute()).toThrow();
});
