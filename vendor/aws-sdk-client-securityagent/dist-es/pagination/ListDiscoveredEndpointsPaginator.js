import { createPaginator } from "@smithy/core";
import { ListDiscoveredEndpointsCommand, } from "../commands/ListDiscoveredEndpointsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListDiscoveredEndpoints = createPaginator(SecurityAgentClient, ListDiscoveredEndpointsCommand, "nextToken", "nextToken", "maxResults");
