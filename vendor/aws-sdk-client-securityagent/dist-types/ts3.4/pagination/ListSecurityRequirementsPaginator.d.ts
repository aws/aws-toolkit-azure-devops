import { Paginator } from "@smithy/types";
import { ListSecurityRequirementsCommandInput, ListSecurityRequirementsCommandOutput } from "../commands/ListSecurityRequirementsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListSecurityRequirements: (config: SecurityAgentPaginationConfiguration, input: ListSecurityRequirementsCommandInput, ...rest: any[]) => Paginator<ListSecurityRequirementsCommandOutput>;
