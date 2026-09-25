import type { Paginator } from "@smithy/types";
import { ListArtifactsCommandInput, ListArtifactsCommandOutput } from "../commands/ListArtifactsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListArtifacts: (config: SecurityAgentPaginationConfiguration, input: ListArtifactsCommandInput, ...rest: any[]) => Paginator<ListArtifactsCommandOutput>;
