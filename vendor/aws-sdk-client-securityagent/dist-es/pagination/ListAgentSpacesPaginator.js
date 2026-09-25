import { createPaginator } from "@smithy/core";
import { ListAgentSpacesCommand, } from "../commands/ListAgentSpacesCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListAgentSpaces = createPaginator(SecurityAgentClient, ListAgentSpacesCommand, "nextToken", "nextToken", "maxResults");
