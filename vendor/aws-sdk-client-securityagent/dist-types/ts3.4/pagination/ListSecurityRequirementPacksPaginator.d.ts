import { Paginator } from "@smithy/types";
import { ListSecurityRequirementPacksCommandInput, ListSecurityRequirementPacksCommandOutput } from "../commands/ListSecurityRequirementPacksCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListSecurityRequirementPacks: (config: SecurityAgentPaginationConfiguration, input: ListSecurityRequirementPacksCommandInput, ...rest: any[]) => Paginator<ListSecurityRequirementPacksCommandOutput>;
