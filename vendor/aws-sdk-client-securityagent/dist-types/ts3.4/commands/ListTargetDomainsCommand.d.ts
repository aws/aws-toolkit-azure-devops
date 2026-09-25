import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { ListTargetDomainsInput, ListTargetDomainsOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link ListTargetDomainsCommand}.
 */
export interface ListTargetDomainsCommandInput extends ListTargetDomainsInput {
}
/**
 * @public
 *
 * The output of {@link ListTargetDomainsCommand}.
 */
export interface ListTargetDomainsCommandOutput extends ListTargetDomainsOutput, __MetadataBearer {
}
declare const ListTargetDomainsCommand_base: {
    new (input: ListTargetDomainsCommandInput): import("@smithy/core/client").CommandImpl<ListTargetDomainsCommandInput, ListTargetDomainsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (...[input]: [
    ] | [
        ListTargetDomainsCommandInput
    ]): import("@smithy/core/client").CommandImpl<ListTargetDomainsCommandInput, ListTargetDomainsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Returns a paginated list of target domain summaries in your account.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, ListTargetDomainsCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, ListTargetDomainsCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // ListTargetDomainsInput
 *   nextToken: "STRING_VALUE",
 *   maxResults: Number("int"),
 * };
 * const command = new ListTargetDomainsCommand(input);
 * const response = await client.send(command);
 * // { // ListTargetDomainsOutput
 * //   targetDomainSummaries: [ // TargetDomainSummaryList
 * //     { // TargetDomainSummary
 * //       targetDomainId: "STRING_VALUE", // required
 * //       domainName: "STRING_VALUE", // required
 * //       verificationStatus: "PENDING" || "VERIFIED" || "FAILED" || "UNREACHABLE",
 * //     },
 * //   ],
 * //   nextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param ListTargetDomainsCommandInput - {@link ListTargetDomainsCommandInput}
 * @returns {@link ListTargetDomainsCommandOutput}
 * @see {@link ListTargetDomainsCommandInput} for command's `input` shape.
 * @see {@link ListTargetDomainsCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class ListTargetDomainsCommand extends ListTargetDomainsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: ListTargetDomainsInput;
            output: ListTargetDomainsOutput;
        };
        sdk: {
            input: ListTargetDomainsCommandInput;
            output: ListTargetDomainsCommandOutput;
        };
    };
}
