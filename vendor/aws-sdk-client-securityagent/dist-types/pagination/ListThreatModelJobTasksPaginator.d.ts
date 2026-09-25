import type { Paginator } from "@smithy/types";
import { ListThreatModelJobTasksCommandInput, ListThreatModelJobTasksCommandOutput } from "../commands/ListThreatModelJobTasksCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListThreatModelJobTasks: (config: SecurityAgentPaginationConfiguration, input: ListThreatModelJobTasksCommandInput, ...rest: any[]) => Paginator<ListThreatModelJobTasksCommandOutput>;
