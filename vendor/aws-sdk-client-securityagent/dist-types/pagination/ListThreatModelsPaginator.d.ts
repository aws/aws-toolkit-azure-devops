import type { Paginator } from "@smithy/types";
import { ListThreatModelsCommandInput, ListThreatModelsCommandOutput } from "../commands/ListThreatModelsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListThreatModels: (config: SecurityAgentPaginationConfiguration, input: ListThreatModelsCommandInput, ...rest: any[]) => Paginator<ListThreatModelsCommandOutput>;
