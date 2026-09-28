import { createPaginator } from "@smithy/core";
import { ListThreatsCommand } from "../commands/ListThreatsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListThreats = createPaginator(SecurityAgentClient, ListThreatsCommand, "nextToken", "nextToken", "maxResults");
