import { Paginator } from "@smithy/types";
import { ListAgentSpacesCommandInput, ListAgentSpacesCommandOutput } from "../commands/ListAgentSpacesCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListAgentSpaces: (config: SecurityAgentPaginationConfiguration, input: ListAgentSpacesCommandInput, ...rest: any[]) => Paginator<ListAgentSpacesCommandOutput>;
