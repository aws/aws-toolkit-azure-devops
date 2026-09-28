import { Paginator } from "@smithy/types";
import { ListThreatsCommandInput, ListThreatsCommandOutput } from "../commands/ListThreatsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListThreats: (config: SecurityAgentPaginationConfiguration, input: ListThreatsCommandInput, ...rest: any[]) => Paginator<ListThreatsCommandOutput>;
