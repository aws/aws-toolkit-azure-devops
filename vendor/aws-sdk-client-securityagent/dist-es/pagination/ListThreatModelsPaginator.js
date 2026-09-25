import { createPaginator } from "@smithy/core";
import { ListThreatModelsCommand, } from "../commands/ListThreatModelsCommand";
import { SecurityAgentClient } from "../SecurityAgentClient";
export const paginateListThreatModels = createPaginator(SecurityAgentClient, ListThreatModelsCommand, "nextToken", "nextToken", "maxResults");
