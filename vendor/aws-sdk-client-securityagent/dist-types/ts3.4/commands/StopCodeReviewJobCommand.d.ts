import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { StopCodeReviewJobInput, StopCodeReviewJobOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link StopCodeReviewJobCommand}.
 */
export interface StopCodeReviewJobCommandInput extends StopCodeReviewJobInput {
}
/**
 * @public
 *
 * The output of {@link StopCodeReviewJobCommand}.
 */
export interface StopCodeReviewJobCommandOutput extends StopCodeReviewJobOutput, __MetadataBearer {
}
declare const StopCodeReviewJobCommand_base: {
    new (input: StopCodeReviewJobCommandInput): import("@smithy/core/client").CommandImpl<StopCodeReviewJobCommandInput, StopCodeReviewJobCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: StopCodeReviewJobCommandInput): import("@smithy/core/client").CommandImpl<StopCodeReviewJobCommandInput, StopCodeReviewJobCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Stops a running code review job. The job transitions to a stopping state and then to stopped after cleanup completes.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, StopCodeReviewJobCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, StopCodeReviewJobCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // StopCodeReviewJobInput
 *   agentSpaceId: "STRING_VALUE", // required
 *   codeReviewJobId: "STRING_VALUE", // required
 * };
 * const command = new StopCodeReviewJobCommand(input);
 * const response = await client.send(command);
 * // {};
 *
 * ```
 *
 * @param StopCodeReviewJobCommandInput - {@link StopCodeReviewJobCommandInput}
 * @returns {@link StopCodeReviewJobCommandOutput}
 * @see {@link StopCodeReviewJobCommandInput} for command's `input` shape.
 * @see {@link StopCodeReviewJobCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class StopCodeReviewJobCommand extends StopCodeReviewJobCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: StopCodeReviewJobInput;
            output: {};
        };
        sdk: {
            input: StopCodeReviewJobCommandInput;
            output: StopCodeReviewJobCommandOutput;
        };
    };
}
