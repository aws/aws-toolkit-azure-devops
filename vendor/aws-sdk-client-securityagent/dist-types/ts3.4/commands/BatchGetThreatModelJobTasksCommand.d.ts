import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { BatchGetThreatModelJobTasksInput, BatchGetThreatModelJobTasksOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link BatchGetThreatModelJobTasksCommand}.
 */
export interface BatchGetThreatModelJobTasksCommandInput extends BatchGetThreatModelJobTasksInput {
}
/**
 * @public
 *
 * The output of {@link BatchGetThreatModelJobTasksCommand}.
 */
export interface BatchGetThreatModelJobTasksCommandOutput extends BatchGetThreatModelJobTasksOutput, __MetadataBearer {
}
declare const BatchGetThreatModelJobTasksCommand_base: {
    new (input: BatchGetThreatModelJobTasksCommandInput): import("@smithy/core/client").CommandImpl<BatchGetThreatModelJobTasksCommandInput, BatchGetThreatModelJobTasksCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: BatchGetThreatModelJobTasksCommandInput): import("@smithy/core/client").CommandImpl<BatchGetThreatModelJobTasksCommandInput, BatchGetThreatModelJobTasksCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Retrieves information about one or more tasks within a threat model job.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, BatchGetThreatModelJobTasksCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, BatchGetThreatModelJobTasksCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // BatchGetThreatModelJobTasksInput
 *   agentSpaceId: "STRING_VALUE", // required
 *   threatModelJobTaskIds: [ // TaskIdList // required
 *     "STRING_VALUE",
 *   ],
 * };
 * const command = new BatchGetThreatModelJobTasksCommand(input);
 * const response = await client.send(command);
 * // { // BatchGetThreatModelJobTasksOutput
 * //   threatModelJobTasks: [ // ThreatModelJobTaskList
 * //     { // ThreatModelJobTask
 * //       taskId: "STRING_VALUE", // required
 * //       threatModelId: "STRING_VALUE",
 * //       threatModelJobId: "STRING_VALUE",
 * //       agentSpaceId: "STRING_VALUE",
 * //       title: "STRING_VALUE",
 * //       description: "STRING_VALUE",
 * //       executionStatus: "IN_PROGRESS" || "ABORTED" || "COMPLETED" || "INTERNAL_ERROR" || "FAILED",
 * //       logsLocation: { // LogLocation
 * //         logType: "CLOUDWATCH",
 * //         cloudWatchLog: { // CloudWatchLog
 * //           logGroup: "STRING_VALUE",
 * //           logStream: "STRING_VALUE",
 * //         },
 * //       },
 * //       createdAt: new Date("TIMESTAMP"),
 * //       updatedAt: new Date("TIMESTAMP"),
 * //     },
 * //   ],
 * //   notFound: [ // TaskIdList
 * //     "STRING_VALUE",
 * //   ],
 * // };
 *
 * ```
 *
 * @param BatchGetThreatModelJobTasksCommandInput - {@link BatchGetThreatModelJobTasksCommandInput}
 * @returns {@link BatchGetThreatModelJobTasksCommandOutput}
 * @see {@link BatchGetThreatModelJobTasksCommandInput} for command's `input` shape.
 * @see {@link BatchGetThreatModelJobTasksCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class BatchGetThreatModelJobTasksCommand extends BatchGetThreatModelJobTasksCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: BatchGetThreatModelJobTasksInput;
            output: BatchGetThreatModelJobTasksOutput;
        };
        sdk: {
            input: BatchGetThreatModelJobTasksCommandInput;
            output: BatchGetThreatModelJobTasksCommandOutput;
        };
    };
}
