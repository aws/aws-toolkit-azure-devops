import { createPaginator } from "@smithy/core";
import { ListArtifactsCommand, } from "../commands/ListArtifactsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListArtifacts = createPaginator(SecurityAgentClient, ListArtifactsCommand, "nextToken", "nextToken", "maxResults");
