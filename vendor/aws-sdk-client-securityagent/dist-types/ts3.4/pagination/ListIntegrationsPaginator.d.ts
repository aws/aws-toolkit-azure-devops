import { Paginator } from "@smithy/types";
import { ListIntegrationsCommandInput, ListIntegrationsCommandOutput } from "../commands/ListIntegrationsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListIntegrations: (config: SecurityAgentPaginationConfiguration, input: ListIntegrationsCommandInput, ...rest: any[]) => Paginator<ListIntegrationsCommandOutput>;
