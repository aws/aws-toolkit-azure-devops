import type { Paginator } from "@smithy/types";
import { ListDiscoveredEndpointsCommandInput, ListDiscoveredEndpointsCommandOutput } from "../commands/ListDiscoveredEndpointsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListDiscoveredEndpoints: (config: SecurityAgentPaginationConfiguration, input: ListDiscoveredEndpointsCommandInput, ...rest: any[]) => Paginator<ListDiscoveredEndpointsCommandOutput>;
