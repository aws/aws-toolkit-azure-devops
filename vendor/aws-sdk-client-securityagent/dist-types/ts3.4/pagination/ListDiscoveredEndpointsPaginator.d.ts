import { Paginator } from "@smithy/types";
import { ListDiscoveredEndpointsCommandInput, ListDiscoveredEndpointsCommandOutput } from "../commands/ListDiscoveredEndpointsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListDiscoveredEndpoints: (config: SecurityAgentPaginationConfiguration, input: ListDiscoveredEndpointsCommandInput, ...rest: any[]) => Paginator<ListDiscoveredEndpointsCommandOutput>;
