import type { MetadataBearer as __MetadataBearer } from "@smithy/types";
import type { ListCodeReviewsInput, ListCodeReviewsOutput } from "../models/models_0";
/**
 * @public
 */
export type { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link ListCodeReviewsCommand}.
 */
export interface ListCodeReviewsCommandInput extends ListCodeReviewsInput {
}
/**
 * @public
 *
 * The output of {@link ListCodeReviewsCommand}.
 */
export interface ListCodeReviewsCommandOutput extends ListCodeReviewsOutput, __MetadataBearer {
}
declare const ListCodeReviewsCommand_base: {
    new (input: ListCodeReviewsCommandInput): import("@smithy/core/client").CommandImpl<ListCodeReviewsCommandInput, ListCodeReviewsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: ListCodeReviewsCommandInput): import("@smithy/core/client").CommandImpl<ListCodeReviewsCommandInput, ListCodeReviewsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Returns a paginated list of code review summaries for the specified agent space.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, ListCodeReviewsCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, ListCodeReviewsCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // ListCodeReviewsInput
 *   maxResults: Number("int"),
 *   nextToken: "STRING_VALUE",
 *   agentSpaceId: "STRING_VALUE", // required
 * };
 * const command = new ListCodeReviewsCommand(input);
 * const response = await client.send(command);
 * // { // ListCodeReviewsOutput
 * //   codeReviewSummaries: [ // CodeReviewSummaryList
 * //     { // CodeReviewSummary
 * //       codeReviewId: "STRING_VALUE", // required
 * //       agentSpaceId: "STRING_VALUE", // required
 * //       title: "STRING_VALUE", // required
 * //       createdAt: new Date("TIMESTAMP"),
 * //       updatedAt: new Date("TIMESTAMP"),
 * //     },
 * //   ],
 * //   nextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param ListCodeReviewsCommandInput - {@link ListCodeReviewsCommandInput}
 * @returns {@link ListCodeReviewsCommandOutput}
 * @see {@link ListCodeReviewsCommandInput} for command's `input` shape.
 * @see {@link ListCodeReviewsCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class ListCodeReviewsCommand extends ListCodeReviewsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: ListCodeReviewsInput;
            output: ListCodeReviewsOutput;
        };
        sdk: {
            input: ListCodeReviewsCommandInput;
            output: ListCodeReviewsCommandOutput;
        };
    };
}
