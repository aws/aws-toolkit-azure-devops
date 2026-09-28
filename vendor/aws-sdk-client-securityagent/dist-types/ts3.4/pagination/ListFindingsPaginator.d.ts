import { Paginator } from "@smithy/types";
import { ListFindingsCommandInput, ListFindingsCommandOutput } from "../commands/ListFindingsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListFindings: (config: SecurityAgentPaginationConfiguration, input: ListFindingsCommandInput, ...rest: any[]) => Paginator<ListFindingsCommandOutput>;
