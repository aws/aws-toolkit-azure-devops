import type { Paginator } from "@smithy/types";
import { ListFindingsCommandInput, ListFindingsCommandOutput } from "../commands/ListFindingsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListFindings: (config: SecurityAgentPaginationConfiguration, input: ListFindingsCommandInput, ...rest: any[]) => Paginator<ListFindingsCommandOutput>;
