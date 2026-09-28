import { createPaginator } from "@smithy/core";
import { ListMembershipsCommand, } from "../commands/ListMembershipsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListMemberships = createPaginator(SecurityAgentClient, ListMembershipsCommand, "nextToken", "nextToken", "maxResults");
