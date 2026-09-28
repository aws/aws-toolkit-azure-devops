import { Paginator } from "@smithy/types";
import { ListIntegratedResourcesCommandInput, ListIntegratedResourcesCommandOutput } from "../commands/ListIntegratedResourcesCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListIntegratedResources: (config: SecurityAgentPaginationConfiguration, input: ListIntegratedResourcesCommandInput, ...rest: any[]) => Paginator<ListIntegratedResourcesCommandOutput>;
