import { Paginator } from "@smithy/types";
import { ListMembershipsCommandInput, ListMembershipsCommandOutput } from "../commands/ListMembershipsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListMemberships: (config: SecurityAgentPaginationConfiguration, input: ListMembershipsCommandInput, ...rest: any[]) => Paginator<ListMembershipsCommandOutput>;
