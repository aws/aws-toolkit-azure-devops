import type { Paginator } from "@smithy/types";
import { ListAgentSpacesCommandInput, ListAgentSpacesCommandOutput } from "../commands/ListAgentSpacesCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListAgentSpaces: (config: SecurityAgentPaginationConfiguration, input: ListAgentSpacesCommandInput, ...rest: any[]) => Paginator<ListAgentSpacesCommandOutput>;
