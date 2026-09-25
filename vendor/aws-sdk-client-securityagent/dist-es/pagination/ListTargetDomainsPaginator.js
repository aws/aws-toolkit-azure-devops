import { createPaginator } from "@smithy/core";
import { ListTargetDomainsCommand, } from "../commands/ListTargetDomainsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListTargetDomains = createPaginator(SecurityAgentClient, ListTargetDomainsCommand, "nextToken", "nextToken", "maxResults");
