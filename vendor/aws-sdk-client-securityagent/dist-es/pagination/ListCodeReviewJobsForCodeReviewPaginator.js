import { createPaginator } from "@smithy/core";
import { ListCodeReviewJobsForCodeReviewCommand, } from "../commands/ListCodeReviewJobsForCodeReviewCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListCodeReviewJobsForCodeReview = createPaginator(SecurityAgentClient, ListCodeReviewJobsForCodeReviewCommand, "nextToken", "nextToken", "maxResults");
