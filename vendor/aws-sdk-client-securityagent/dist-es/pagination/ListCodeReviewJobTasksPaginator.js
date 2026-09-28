import { createPaginator } from "@smithy/core";
import { ListCodeReviewJobTasksCommand, } from "../commands/ListCodeReviewJobTasksCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListCodeReviewJobTasks = createPaginator(SecurityAgentClient, ListCodeReviewJobTasksCommand, "nextToken", "nextToken", "maxResults");
