import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteApplicationRequest } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link DeleteApplicationCommand}.
 */
export interface DeleteApplicationCommandInput extends DeleteApplicationRequest {
}
/**
 * @public
 *
 * The output of {@link DeleteApplicationCommand}.
 */
export interface DeleteApplicationCommandOutput extends __MetadataBearer {
}
declare const DeleteApplicationCommand_base: {
    new (input: DeleteApplicationCommandInput): import("@smithy/core/client").CommandImpl<DeleteApplicationCommandInput, DeleteApplicationCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: DeleteApplicationCommandInput): import("@smithy/core/client").CommandImpl<DeleteApplicationCommandInput, DeleteApplicationCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Deletes an application and its associated configuration, including IAM Identity Center settings.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, DeleteApplicationCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, DeleteApplicationCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // DeleteApplicationRequest
 *   applicationId: "STRING_VALUE", // required
 * };
 * const command = new DeleteApplicationCommand(input);
 * const response = await client.send(command);
 * // {};
 *
 * ```
 *
 * @param DeleteApplicationCommandInput - {@link DeleteApplicationCommandInput}
 * @returns {@link DeleteApplicationCommandOutput}
 * @see {@link DeleteApplicationCommandInput} for command's `input` shape.
 * @see {@link DeleteApplicationCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class DeleteApplicationCommand extends DeleteApplicationCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DeleteApplicationRequest;
            output: {};
        };
        sdk: {
            input: DeleteApplicationCommandInput;
            output: DeleteApplicationCommandOutput;
        };
    };
}
