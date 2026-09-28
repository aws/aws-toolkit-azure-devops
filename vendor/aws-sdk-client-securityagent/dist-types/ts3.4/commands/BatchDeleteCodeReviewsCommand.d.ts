import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { BatchDeleteCodeReviewsInput, BatchDeleteCodeReviewsOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link BatchDeleteCodeReviewsCommand}.
 */
export interface BatchDeleteCodeReviewsCommandInput extends BatchDeleteCodeReviewsInput {
}
/**
 * @public
 *
 * The output of {@link BatchDeleteCodeReviewsCommand}.
 */
export interface BatchDeleteCodeReviewsCommandOutput extends BatchDeleteCodeReviewsOutput, __MetadataBearer {
}
declare const BatchDeleteCodeReviewsCommand_base: {
    new (input: BatchDeleteCodeReviewsCommandInput): import("@smithy/core/client").CommandImpl<BatchDeleteCodeReviewsCommandInput, BatchDeleteCodeReviewsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: BatchDeleteCodeReviewsCommandInput): import("@smithy/core/client").CommandImpl<BatchDeleteCodeReviewsCommandInput, BatchDeleteCodeReviewsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Deletes one or more code reviews from an agent space.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, BatchDeleteCodeReviewsCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, BatchDeleteCodeReviewsCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // BatchDeleteCodeReviewsInput
 *   codeReviewIds: [ // CodeReviewIdList // required
 *     "STRING_VALUE",
 *   ],
 *   agentSpaceId: "STRING_VALUE", // required
 * };
 * const command = new BatchDeleteCodeReviewsCommand(input);
 * const response = await client.send(command);
 * // { // BatchDeleteCodeReviewsOutput
 * //   deleted: [ // CodeReviewIdList
 * //     "STRING_VALUE",
 * //   ],
 * //   failed: [ // DeleteCodeReviewFailureList
 * //     { // DeleteCodeReviewFailure
 * //       codeReviewId: "STRING_VALUE",
 * //       reason: "STRING_VALUE",
 * //     },
 * //   ],
 * // };
 *
 * ```
 *
 * @param BatchDeleteCodeReviewsCommandInput - {@link BatchDeleteCodeReviewsCommandInput}
 * @returns {@link BatchDeleteCodeReviewsCommandOutput}
 * @see {@link BatchDeleteCodeReviewsCommandInput} for command's `input` shape.
 * @see {@link BatchDeleteCodeReviewsCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class BatchDeleteCodeReviewsCommand extends BatchDeleteCodeReviewsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: BatchDeleteCodeReviewsInput;
            output: BatchDeleteCodeReviewsOutput;
        };
        sdk: {
            input: BatchDeleteCodeReviewsCommandInput;
            output: BatchDeleteCodeReviewsCommandOutput;
        };
    };
}
