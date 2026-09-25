import { createPaginator } from "@smithy/core";
import { ListThreatModelJobsCommand, } from "../commands/ListThreatModelJobsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListThreatModelJobs = createPaginator(SecurityAgentClient, ListThreatModelJobsCommand, "nextToken", "nextToken", "maxResults");
