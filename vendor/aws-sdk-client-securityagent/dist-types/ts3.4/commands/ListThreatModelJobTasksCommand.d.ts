import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { ListThreatModelJobTasksInput, ListThreatModelJobTasksOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link ListThreatModelJobTasksCommand}.
 */
export interface ListThreatModelJobTasksCommandInput extends ListThreatModelJobTasksInput {
}
/**
 * @public
 *
 * The output of {@link ListThreatModelJobTasksCommand}.
 */
export interface ListThreatModelJobTasksCommandOutput extends ListThreatModelJobTasksOutput, __MetadataBearer {
}
declare const ListThreatModelJobTasksCommand_base: {
    new (input: ListThreatModelJobTasksCommandInput): import("@smithy/core/client").CommandImpl<ListThreatModelJobTasksCommandInput, ListThreatModelJobTasksCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: ListThreatModelJobTasksCommandInput): import("@smithy/core/client").CommandImpl<ListThreatModelJobTasksCommandInput, ListThreatModelJobTasksCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Returns a paginated list of task summaries for the specified threat model job.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, ListThreatModelJobTasksCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, ListThreatModelJobTasksCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // ListThreatModelJobTasksInput
 *   agentSpaceId: "STRING_VALUE", // required
 *   maxResults: Number("int"),
 *   threatModelJobId: "STRING_VALUE", // required
 *   nextToken: "STRING_VALUE",
 * };
 * const command = new ListThreatModelJobTasksCommand(input);
 * const response = await client.send(command);
 * // { // ListThreatModelJobTasksOutput
 * //   threatModelJobTaskSummaries: [ // ThreatModelJobTaskSummaryList
 * //     { // ThreatModelJobTaskSummary
 * //       taskId: "STRING_VALUE", // required
 * //       threatModelId: "STRING_VALUE",
 * //       threatModelJobId: "STRING_VALUE",
 * //       agentSpaceId: "STRING_VALUE",
 * //       title: "STRING_VALUE",
 * //       executionStatus: "IN_PROGRESS" || "ABORTED" || "COMPLETED" || "INTERNAL_ERROR" || "FAILED",
 * //       createdAt: new Date("TIMESTAMP"),
 * //       updatedAt: new Date("TIMESTAMP"),
 * //     },
 * //   ],
 * //   nextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param ListThreatModelJobTasksCommandInput - {@link ListThreatModelJobTasksCommandInput}
 * @returns {@link ListThreatModelJobTasksCommandOutput}
 * @see {@link ListThreatModelJobTasksCommandInput} for command's `input` shape.
 * @see {@link ListThreatModelJobTasksCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class ListThreatModelJobTasksCommand extends ListThreatModelJobTasksCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: ListThreatModelJobTasksInput;
            output: ListThreatModelJobTasksOutput;
        };
        sdk: {
            input: ListThreatModelJobTasksCommandInput;
            output: ListThreatModelJobTasksCommandOutput;
        };
    };
}
