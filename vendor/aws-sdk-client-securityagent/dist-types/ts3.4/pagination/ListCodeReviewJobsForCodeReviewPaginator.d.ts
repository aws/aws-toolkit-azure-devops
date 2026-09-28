import { Paginator } from "@smithy/types";
import { ListCodeReviewJobsForCodeReviewCommandInput, ListCodeReviewJobsForCodeReviewCommandOutput } from "../commands/ListCodeReviewJobsForCodeReviewCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListCodeReviewJobsForCodeReview: (config: SecurityAgentPaginationConfiguration, input: ListCodeReviewJobsForCodeReviewCommandInput, ...rest: any[]) => Paginator<ListCodeReviewJobsForCodeReviewCommandOutput>;
