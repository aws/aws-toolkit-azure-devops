import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { UpdateApplicationRequest, UpdateApplicationResponse } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link UpdateApplicationCommand}.
 */
export interface UpdateApplicationCommandInput extends UpdateApplicationRequest {
}
/**
 * @public
 *
 * The output of {@link UpdateApplicationCommand}.
 */
export interface UpdateApplicationCommandOutput extends UpdateApplicationResponse, __MetadataBearer {
}
declare const UpdateApplicationCommand_base: {
    new (input: UpdateApplicationCommandInput): import("@smithy/core/client").CommandImpl<UpdateApplicationCommandInput, UpdateApplicationCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: UpdateApplicationCommandInput): import("@smithy/core/client").CommandImpl<UpdateApplicationCommandInput, UpdateApplicationCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Updates the configuration of an existing application, including the IAM role and default KMS key.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, UpdateApplicationCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, UpdateApplicationCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // UpdateApplicationRequest
 *   applicationId: "STRING_VALUE", // required
 *   roleArn: "STRING_VALUE",
 *   defaultKmsKeyId: "STRING_VALUE",
 * };
 * const command = new UpdateApplicationCommand(input);
 * const response = await client.send(command);
 * // { // UpdateApplicationResponse
 * //   applicationId: "STRING_VALUE", // required
 * // };
 *
 * ```
 *
 * @param UpdateApplicationCommandInput - {@link UpdateApplicationCommandInput}
 * @returns {@link UpdateApplicationCommandOutput}
 * @see {@link UpdateApplicationCommandInput} for command's `input` shape.
 * @see {@link UpdateApplicationCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class UpdateApplicationCommand extends UpdateApplicationCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: UpdateApplicationRequest;
            output: UpdateApplicationResponse;
        };
        sdk: {
            input: UpdateApplicationCommandInput;
            output: UpdateApplicationCommandOutput;
        };
    };
}
