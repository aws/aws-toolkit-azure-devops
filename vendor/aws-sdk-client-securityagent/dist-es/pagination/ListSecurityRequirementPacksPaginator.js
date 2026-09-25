import { createPaginator } from "@smithy/core";
import { ListSecurityRequirementPacksCommand, } from "../commands/ListSecurityRequirementPacksCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListSecurityRequirementPacks = createPaginator(SecurityAgentClient, ListSecurityRequirementPacksCommand, "nextToken", "nextToken", "maxResults");
