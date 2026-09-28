import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { StopThreatModelJobInput, StopThreatModelJobOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link StopThreatModelJobCommand}.
 */
export interface StopThreatModelJobCommandInput extends StopThreatModelJobInput {
}
/**
 * @public
 *
 * The output of {@link StopThreatModelJobCommand}.
 */
export interface StopThreatModelJobCommandOutput extends StopThreatModelJobOutput, __MetadataBearer {
}
declare const StopThreatModelJobCommand_base: {
    new (input: StopThreatModelJobCommandInput): import("@smithy/core/client").CommandImpl<StopThreatModelJobCommandInput, StopThreatModelJobCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: StopThreatModelJobCommandInput): import("@smithy/core/client").CommandImpl<StopThreatModelJobCommandInput, StopThreatModelJobCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Stops a running threat model job.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, StopThreatModelJobCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, StopThreatModelJobCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // StopThreatModelJobInput
 *   agentSpaceId: "STRING_VALUE", // required
 *   threatModelJobId: "STRING_VALUE", // required
 * };
 * const command = new StopThreatModelJobCommand(input);
 * const response = await client.send(command);
 * // {};
 *
 * ```
 *
 * @param StopThreatModelJobCommandInput - {@link StopThreatModelJobCommandInput}
 * @returns {@link StopThreatModelJobCommandOutput}
 * @see {@link StopThreatModelJobCommandInput} for command's `input` shape.
 * @see {@link StopThreatModelJobCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class StopThreatModelJobCommand extends StopThreatModelJobCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: StopThreatModelJobInput;
            output: {};
        };
        sdk: {
            input: StopThreatModelJobCommandInput;
            output: StopThreatModelJobCommandOutput;
        };
    };
}
