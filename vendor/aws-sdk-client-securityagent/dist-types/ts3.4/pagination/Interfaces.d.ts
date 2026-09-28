import { PaginationConfiguration } from "@smithy/types";
import { SecurityAgentClient } from "../SecurityAgentClient";
/**
 * @public
 */
export interface SecurityAgentPaginationConfiguration extends PaginationConfiguration {
    client: SecurityAgentClient;
}
