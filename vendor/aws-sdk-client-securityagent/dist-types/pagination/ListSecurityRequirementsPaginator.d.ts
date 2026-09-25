import type { Paginator } from "@smithy/types";
import { ListSecurityRequirementsCommandInput, ListSecurityRequirementsCommandOutput } from "../commands/ListSecurityRequirementsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListSecurityRequirements: (config: SecurityAgentPaginationConfiguration, input: ListSecurityRequirementsCommandInput, ...rest: any[]) => Paginator<ListSecurityRequirementsCommandOutput>;
