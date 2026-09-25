import { Paginator } from "@smithy/types";
import { ListThreatModelJobTasksCommandInput, ListThreatModelJobTasksCommandOutput } from "../commands/ListThreatModelJobTasksCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListThreatModelJobTasks: (config: SecurityAgentPaginationConfiguration, input: ListThreatModelJobTasksCommandInput, ...rest: any[]) => Paginator<ListThreatModelJobTasksCommandOutput>;
