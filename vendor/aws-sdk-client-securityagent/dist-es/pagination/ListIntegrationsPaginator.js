import { createPaginator } from "@smithy/core";
import { ListIntegrationsCommand, } from "../commands/ListIntegrationsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListIntegrations = createPaginator(SecurityAgentClient, ListIntegrationsCommand, "nextToken", "nextToken", "maxResults");
