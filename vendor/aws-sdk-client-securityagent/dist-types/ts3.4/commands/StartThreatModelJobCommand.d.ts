import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { StartThreatModelJobInput, StartThreatModelJobOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link StartThreatModelJobCommand}.
 */
export interface StartThreatModelJobCommandInput extends StartThreatModelJobInput {
}
/**
 * @public
 *
 * The output of {@link StartThreatModelJobCommand}.
 */
export interface StartThreatModelJobCommandOutput extends StartThreatModelJobOutput, __MetadataBearer {
}
declare const StartThreatModelJobCommand_base: {
    new (input: StartThreatModelJobCommandInput): import("@smithy/core/client").CommandImpl<StartThreatModelJobCommandInput, StartThreatModelJobCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: StartThreatModelJobCommandInput): import("@smithy/core/client").CommandImpl<StartThreatModelJobCommandInput, StartThreatModelJobCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Starts a new threat model job for a threat model configuration.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, StartThreatModelJobCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, StartThreatModelJobCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // StartThreatModelJobInput
 *   agentSpaceId: "STRING_VALUE", // required
 *   threatModelId: "STRING_VALUE", // required
 * };
 * const command = new StartThreatModelJobCommand(input);
 * const response = await client.send(command);
 * // { // StartThreatModelJobOutput
 * //   title: "STRING_VALUE",
 * //   status: "IN_PROGRESS" || "STOPPING" || "STOPPED" || "FAILED" || "COMPLETED",
 * //   createdAt: new Date("TIMESTAMP"),
 * //   updatedAt: new Date("TIMESTAMP"),
 * //   threatModelId: "STRING_VALUE",
 * //   threatModelJobId: "STRING_VALUE", // required
 * //   agentSpaceId: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param StartThreatModelJobCommandInput - {@link StartThreatModelJobCommandInput}
 * @returns {@link StartThreatModelJobCommandOutput}
 * @see {@link StartThreatModelJobCommandInput} for command's `input` shape.
 * @see {@link StartThreatModelJobCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class StartThreatModelJobCommand extends StartThreatModelJobCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: StartThreatModelJobInput;
            output: StartThreatModelJobOutput;
        };
        sdk: {
            input: StartThreatModelJobCommandInput;
            output: StartThreatModelJobCommandOutput;
        };
    };
}
