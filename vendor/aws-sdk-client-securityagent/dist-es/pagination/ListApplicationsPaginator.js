import { createPaginator } from "@smithy/core";
import { ListApplicationsCommand, } from "../commands/ListApplicationsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListApplications = createPaginator(SecurityAgentClient, ListApplicationsCommand, "nextToken", "nextToken", "maxResults");
