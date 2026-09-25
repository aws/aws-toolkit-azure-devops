import type { Paginator } from "@smithy/types";
import { ListSecurityRequirementPacksCommandInput, ListSecurityRequirementPacksCommandOutput } from "../commands/ListSecurityRequirementPacksCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListSecurityRequirementPacks: (config: SecurityAgentPaginationConfiguration, input: ListSecurityRequirementPacksCommandInput, ...rest: any[]) => Paginator<ListSecurityRequirementPacksCommandOutput>;
