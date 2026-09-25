import { Paginator } from "@smithy/types";
import { ListTargetDomainsCommandInput, ListTargetDomainsCommandOutput } from "../commands/ListTargetDomainsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListTargetDomains: (config: SecurityAgentPaginationConfiguration, input: ListTargetDomainsCommandInput, ...rest: any[]) => Paginator<ListTargetDomainsCommandOutput>;
