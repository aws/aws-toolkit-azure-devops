import type { Paginator } from "@smithy/types";
import { ListApplicationsCommandInput, ListApplicationsCommandOutput } from "../commands/ListApplicationsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListApplications: (config: SecurityAgentPaginationConfiguration, input: ListApplicationsCommandInput, ...rest: any[]) => Paginator<ListApplicationsCommandOutput>;
