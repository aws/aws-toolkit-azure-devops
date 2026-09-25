import type { Paginator } from "@smithy/types";
import { ListIntegrationsCommandInput, ListIntegrationsCommandOutput } from "../commands/ListIntegrationsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListIntegrations: (config: SecurityAgentPaginationConfiguration, input: ListIntegrationsCommandInput, ...rest: any[]) => Paginator<ListIntegrationsCommandOutput>;
