import type { Paginator } from "@smithy/types";
import { ListCodeReviewJobTasksCommandInput, ListCodeReviewJobTasksCommandOutput } from "../commands/ListCodeReviewJobTasksCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListCodeReviewJobTasks: (config: SecurityAgentPaginationConfiguration, input: ListCodeReviewJobTasksCommandInput, ...rest: any[]) => Paginator<ListCodeReviewJobTasksCommandOutput>;
