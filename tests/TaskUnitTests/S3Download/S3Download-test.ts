import { TaskOperations } from "../../../Tasks/S3Download/helpers/DownloadTaskOperations"
import { TaskParameters } from "../../../Tasks/S3Download/helpers/DownloadTaskParameters"

it('Creates a TaskOperation', () => {
	const taskParameters = new TaskParameters();
	const operation = new TaskOperations(taskParameters)
});
