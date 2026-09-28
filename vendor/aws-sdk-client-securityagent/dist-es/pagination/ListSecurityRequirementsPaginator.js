import { createPaginator } from "@smithy/core";
import { ListSecurityRequirementsCommand, } from "../commands/ListSecurityRequirementsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListSecurityRequirements = createPaginator(SecurityAgentClient, ListSecurityRequirementsCommand, "nextToken", "nextToken", "maxResults");
