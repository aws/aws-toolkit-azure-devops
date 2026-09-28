import { createPaginator } from "@smithy/core";
import { ListCodeReviewsCommand, } from "../commands/ListCodeReviewsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListCodeReviews = createPaginator(SecurityAgentClient, ListCodeReviewsCommand, "nextToken", "nextToken", "maxResults");
