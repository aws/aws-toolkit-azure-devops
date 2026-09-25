import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { DeleteMembershipRequest, DeleteMembershipResponse } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link DeleteMembershipCommand}.
 */
export interface DeleteMembershipCommandInput extends DeleteMembershipRequest {
}
/**
 * @public
 *
 * The output of {@link DeleteMembershipCommand}.
 */
export interface DeleteMembershipCommandOutput extends DeleteMembershipResponse, __MetadataBearer {
}
declare const DeleteMembershipCommand_base: {
    new (input: DeleteMembershipCommandInput): import("@smithy/core/client").CommandImpl<DeleteMembershipCommandInput, DeleteMembershipCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: DeleteMembershipCommandInput): import("@smithy/core/client").CommandImpl<DeleteMembershipCommandInput, DeleteMembershipCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Deletes a membership, revoking a user's access to an agent space.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, DeleteMembershipCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, DeleteMembershipCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // DeleteMembershipRequest
 *   applicationId: "STRING_VALUE", // required
 *   agentSpaceId: "STRING_VALUE", // required
 *   membershipId: "STRING_VALUE", // required
 *   memberType: "USER",
 * };
 * const command = new DeleteMembershipCommand(input);
 * const response = await client.send(command);
 * // {};
 *
 * ```
 *
 * @param DeleteMembershipCommandInput - {@link DeleteMembershipCommandInput}
 * @returns {@link DeleteMembershipCommandOutput}
 * @see {@link DeleteMembershipCommandInput} for command's `input` shape.
 * @see {@link DeleteMembershipCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class DeleteMembershipCommand extends DeleteMembershipCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DeleteMembershipRequest;
            output: {};
        };
        sdk: {
            input: DeleteMembershipCommandInput;
            output: DeleteMembershipCommandOutput;
        };
    };
}
