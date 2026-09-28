import type { Paginator } from "@smithy/types";
import { ListThreatModelJobsCommandInput, ListThreatModelJobsCommandOutput } from "../commands/ListThreatModelJobsCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListThreatModelJobs: (config: SecurityAgentPaginationConfiguration, input: ListThreatModelJobsCommandInput, ...rest: any[]) => Paginator<ListThreatModelJobsCommandOutput>;
