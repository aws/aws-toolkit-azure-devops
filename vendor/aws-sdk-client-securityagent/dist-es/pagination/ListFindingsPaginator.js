import { createPaginator } from "@smithy/core";
import { ListFindingsCommand, } from "../commands/ListFindingsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListFindings = createPaginator(SecurityAgentClient, ListFindingsCommand, "nextToken", "nextToken", "maxResults");
