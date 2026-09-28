import type { Paginator } from "@smithy/types";
import { ListCodeReviewJobsForCodeReviewCommandInput, ListCodeReviewJobsForCodeReviewCommandOutput } from "../commands/ListCodeReviewJobsForCodeReviewCommand";
import type { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListCodeReviewJobsForCodeReview: (config: SecurityAgentPaginationConfiguration, input: ListCodeReviewJobsForCodeReviewCommandInput, ...rest: any[]) => Paginator<ListCodeReviewJobsForCodeReviewCommandOutput>;
