import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { ListIntegrationsInput, ListIntegrationsOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link ListIntegrationsCommand}.
 */
export interface ListIntegrationsCommandInput extends ListIntegrationsInput {
}
/**
 * @public
 *
 * The output of {@link ListIntegrationsCommand}.
 */
export interface ListIntegrationsCommandOutput extends ListIntegrationsOutput, __MetadataBearer {
}
declare const ListIntegrationsCommand_base: {
    new (input: ListIntegrationsCommandInput): import("@smithy/core/client").CommandImpl<ListIntegrationsCommandInput, ListIntegrationsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (...[input]: [
    ] | [
        ListIntegrationsCommandInput
    ]): import("@smithy/core/client").CommandImpl<ListIntegrationsCommandInput, ListIntegrationsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Lists the integrations in your account, optionally filtered by provider or provider type.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, ListIntegrationsCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, ListIntegrationsCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // ListIntegrationsInput
 *   filter: { // IntegrationFilter Union: only one key present
 *     provider: "GITHUB" || "GITLAB" || "BITBUCKET" || "CONFLUENCE",
 *     providerType: "SOURCE_CODE" || "DOCUMENTATION",
 *   },
 *   nextToken: "STRING_VALUE",
 *   maxResults: Number("int"),
 * };
 * const command = new ListIntegrationsCommand(input);
 * const response = await client.send(command);
 * // { // ListIntegrationsOutput
 * //   integrationSummaries: [ // IntegrationSummaryList // required
 * //     { // IntegrationSummary
 * //       integrationId: "STRING_VALUE", // required
 * //       installationId: "STRING_VALUE", // required
 * //       provider: "GITHUB" || "GITLAB" || "BITBUCKET" || "CONFLUENCE", // required
 * //       providerType: "SOURCE_CODE" || "DOCUMENTATION", // required
 * //       displayName: "STRING_VALUE", // required
 * //       targetUrl: "STRING_VALUE",
 * //       privateConnectionName: "STRING_VALUE",
 * //     },
 * //   ],
 * //   nextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param ListIntegrationsCommandInput - {@link ListIntegrationsCommandInput}
 * @returns {@link ListIntegrationsCommandOutput}
 * @see {@link ListIntegrationsCommandInput} for command's `input` shape.
 * @see {@link ListIntegrationsCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link AccessDeniedException} (client fault)
 *  <p>You do not have sufficient access to perform this action.</p>
 *
 * @throws {@link InternalServerException} (server fault)
 *  <p>An unexpected error occurred during the processing of your request.</p>
 *
 * @throws {@link ResourceNotFoundException} (client fault)
 *  <p>The specified resource was not found. Verify that the resource identifier is correct and that the resource exists in the specified agent space or account.</p>
 *
 * @throws {@link ThrottlingException} (client fault)
 *  <p>The request was denied due to request throttling.</p>
 *
 * @throws {@link ValidationException} (client fault)
 *  <p>The input fails to satisfy the constraints specified by the service.</p>
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class ListIntegrationsCommand extends ListIntegrationsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: ListIntegrationsInput;
            output: ListIntegrationsOutput;
        };
        sdk: {
            input: ListIntegrationsCommandInput;
            output: ListIntegrationsCommandOutput;
        };
    };
}
