import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { CreateApplicationRequest, CreateApplicationResponse } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link CreateApplicationCommand}.
 */
export interface CreateApplicationCommandInput extends CreateApplicationRequest {
}
/**
 * @public
 *
 * The output of {@link CreateApplicationCommand}.
 */
export interface CreateApplicationCommandOutput extends CreateApplicationResponse, __MetadataBearer {
}
declare const CreateApplicationCommand_base: {
    new (input: CreateApplicationCommandInput): import("@smithy/core/client").CommandImpl<CreateApplicationCommandInput, CreateApplicationCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (...[input]: [
    ] | [
        CreateApplicationCommandInput
    ]): import("@smithy/core/client").CommandImpl<CreateApplicationCommandInput, CreateApplicationCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Creates a new application. An application is the top-level organizational unit that supports IAM Identity Center integration.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, CreateApplicationCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, CreateApplicationCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // CreateApplicationRequest
 *   idcInstanceArn: "STRING_VALUE",
 *   roleArn: "STRING_VALUE",
 *   defaultKmsKeyId: "STRING_VALUE",
 *   tags: { // TagMap
 *     "<keys>": "STRING_VALUE",
 *   },
 * };
 * const command = new CreateApplicationCommand(input);
 * const response = await client.send(command);
 * // { // CreateApplicationResponse
 * //   applicationId: "STRING_VALUE", // required
 * // };
 *
 * ```
 *
 * @param CreateApplicationCommandInput - {@link CreateApplicationCommandInput}
 * @returns {@link CreateApplicationCommandOutput}
 * @see {@link CreateApplicationCommandInput} for command's `input` shape.
 * @see {@link CreateApplicationCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class CreateApplicationCommand extends CreateApplicationCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: CreateApplicationRequest;
            output: CreateApplicationResponse;
        };
        sdk: {
            input: CreateApplicationCommandInput;
            output: CreateApplicationCommandOutput;
        };
    };
}
