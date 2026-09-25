import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteAgentSpaceInput, DeleteAgentSpaceOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link DeleteAgentSpaceCommand}.
 */
export interface DeleteAgentSpaceCommandInput extends DeleteAgentSpaceInput {
}
/**
 * @public
 *
 * The output of {@link DeleteAgentSpaceCommand}.
 */
export interface DeleteAgentSpaceCommandOutput extends DeleteAgentSpaceOutput, __MetadataBearer {
}
declare const DeleteAgentSpaceCommand_base: {
    new (input: DeleteAgentSpaceCommandInput): import("@smithy/core/client").CommandImpl<DeleteAgentSpaceCommandInput, DeleteAgentSpaceCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: DeleteAgentSpaceCommandInput): import("@smithy/core/client").CommandImpl<DeleteAgentSpaceCommandInput, DeleteAgentSpaceCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Deletes an agent space and all of its associated resources, including pentests, findings, and artifacts.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, DeleteAgentSpaceCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, DeleteAgentSpaceCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // DeleteAgentSpaceInput
 *   agentSpaceId: "STRING_VALUE", // required
 * };
 * const command = new DeleteAgentSpaceCommand(input);
 * const response = await client.send(command);
 * // { // DeleteAgentSpaceOutput
 * //   agentSpaceId: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DeleteAgentSpaceCommandInput - {@link DeleteAgentSpaceCommandInput}
 * @returns {@link DeleteAgentSpaceCommandOutput}
 * @see {@link DeleteAgentSpaceCommandInput} for command's `input` shape.
 * @see {@link DeleteAgentSpaceCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class DeleteAgentSpaceCommand extends DeleteAgentSpaceCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DeleteAgentSpaceInput;
            output: DeleteAgentSpaceOutput;
        };
        sdk: {
            input: DeleteAgentSpaceCommandInput;
            output: DeleteAgentSpaceCommandOutput;
        };
    };
}
