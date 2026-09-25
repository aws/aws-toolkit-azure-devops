import { createPaginator } from "@smithy/core";
import { ListPrivateConnectionsCommand, } from "../commands/ListPrivateConnectionsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListPrivateConnections = createPaginator(SecurityAgentClient, ListPrivateConnectionsCommand, "nextToken", "nextToken", "maxResults");
