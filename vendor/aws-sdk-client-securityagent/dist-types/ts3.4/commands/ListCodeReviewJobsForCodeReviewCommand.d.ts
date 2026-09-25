import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { ListCodeReviewJobsForCodeReviewInput, ListCodeReviewJobsForCodeReviewOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link ListCodeReviewJobsForCodeReviewCommand}.
 */
export interface ListCodeReviewJobsForCodeReviewCommandInput extends ListCodeReviewJobsForCodeReviewInput {
}
/**
 * @public
 *
 * The output of {@link ListCodeReviewJobsForCodeReviewCommand}.
 */
export interface ListCodeReviewJobsForCodeReviewCommandOutput extends ListCodeReviewJobsForCodeReviewOutput, __MetadataBearer {
}
declare const ListCodeReviewJobsForCodeReviewCommand_base: {
    new (input: ListCodeReviewJobsForCodeReviewCommandInput): import("@smithy/core/client").CommandImpl<ListCodeReviewJobsForCodeReviewCommandInput, ListCodeReviewJobsForCodeReviewCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: ListCodeReviewJobsForCodeReviewCommandInput): import("@smithy/core/client").CommandImpl<ListCodeReviewJobsForCodeReviewCommandInput, ListCodeReviewJobsForCodeReviewCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Returns a paginated list of code review job summaries for the specified code review configuration.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, ListCodeReviewJobsForCodeReviewCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, ListCodeReviewJobsForCodeReviewCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // ListCodeReviewJobsForCodeReviewInput
 *   maxResults: Number("int"),
 *   codeReviewId: "STRING_VALUE", // required
 *   agentSpaceId: "STRING_VALUE", // required
 *   nextToken: "STRING_VALUE",
 * };
 * const command = new ListCodeReviewJobsForCodeReviewCommand(input);
 * const response = await client.send(command);
 * // { // ListCodeReviewJobsForCodeReviewOutput
 * //   codeReviewJobSummaries: [ // CodeReviewJobSummaryList
 * //     { // CodeReviewJobSummary
 * //       codeReviewJobId: "STRING_VALUE", // required
 * //       codeReviewId: "STRING_VALUE", // required
 * //       title: "STRING_VALUE",
 * //       status: "IN_PROGRESS" || "STOPPING" || "STOPPED" || "FAILED" || "COMPLETED",
 * //       createdAt: new Date("TIMESTAMP"),
 * //       updatedAt: new Date("TIMESTAMP"),
 * //     },
 * //   ],
 * //   nextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param ListCodeReviewJobsForCodeReviewCommandInput - {@link ListCodeReviewJobsForCodeReviewCommandInput}
 * @returns {@link ListCodeReviewJobsForCodeReviewCommandOutput}
 * @see {@link ListCodeReviewJobsForCodeReviewCommandInput} for command's `input` shape.
 * @see {@link ListCodeReviewJobsForCodeReviewCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class ListCodeReviewJobsForCodeReviewCommand extends ListCodeReviewJobsForCodeReviewCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: ListCodeReviewJobsForCodeReviewInput;
            output: ListCodeReviewJobsForCodeReviewOutput;
        };
        sdk: {
            input: ListCodeReviewJobsForCodeReviewCommandInput;
            output: ListCodeReviewJobsForCodeReviewCommandOutput;
        };
    };
}
