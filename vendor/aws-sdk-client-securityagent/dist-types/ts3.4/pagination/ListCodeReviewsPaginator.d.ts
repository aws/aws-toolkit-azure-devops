import { Paginator } from "@smithy/types";
import { ListCodeReviewsCommandInput, ListCodeReviewsCommandOutput } from "../commands/ListCodeReviewsCommand";
import { SecurityAgentPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateListCodeReviews: (config: SecurityAgentPaginationConfiguration, input: ListCodeReviewsCommandInput, ...rest: any[]) => Paginator<ListCodeReviewsCommandOutput>;
