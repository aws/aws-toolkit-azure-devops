import { createPaginator } from "@smithy/core";
import { ListIntegratedResourcesCommand, } from "../commands/ListIntegratedResourcesCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListIntegratedResources = createPaginator(SecurityAgentClient, ListIntegratedResourcesCommand, "nextToken", "nextToken", "maxResults");
