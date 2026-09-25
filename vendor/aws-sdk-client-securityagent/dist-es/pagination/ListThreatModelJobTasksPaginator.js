import { createPaginator } from "@smithy/core";
import { ListThreatModelJobTasksCommand, } from "../commands/ListThreatModelJobTasksCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListThreatModelJobTasks = createPaginator(SecurityAgentClient, ListThreatModelJobTasksCommand, "nextToken", "nextToken", "maxResults");
