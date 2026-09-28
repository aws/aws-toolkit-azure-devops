import type { Paginator } from "@smithy/types";
import { ListPrivateConnectionsCommandInput, ListPrivateConnectionsCommandOutput } from "../commands/ListPrivateConnectionsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListPrivateConnections: (config: SecurityAgentPaginationConfiguration, input: ListPrivateConnectionsCommandInput, ...rest: any[]) => Paginator<ListPrivateConnectionsCommandOutput>;
