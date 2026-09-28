import { Paginator } from "@smithy/types";
import { ListArtifactsCommandInput, ListArtifactsCommandOutput } from "../commands/ListArtifactsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListArtifacts: (config: SecurityAgentPaginationConfiguration, input: ListArtifactsCommandInput, ...rest: any[]) => Paginator<ListArtifactsCommandOutput>;
