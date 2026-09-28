import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { BatchGetCodeReviewJobsInput, BatchGetCodeReviewJobsOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link BatchGetCodeReviewJobsCommand}.
 */
export interface BatchGetCodeReviewJobsCommandInput extends BatchGetCodeReviewJobsInput {
}
/**
 * @public
 *
 * The output of {@link BatchGetCodeReviewJobsCommand}.
 */
export interface BatchGetCodeReviewJobsCommandOutput extends BatchGetCodeReviewJobsOutput, __MetadataBearer {
}
declare const BatchGetCodeReviewJobsCommand_base: {
    new (input: BatchGetCodeReviewJobsCommandInput): import("@smithy/core/client").CommandImpl<BatchGetCodeReviewJobsCommandInput, BatchGetCodeReviewJobsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: BatchGetCodeReviewJobsCommandInput): import("@smithy/core/client").CommandImpl<BatchGetCodeReviewJobsCommandInput, BatchGetCodeReviewJobsCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Retrieves information about one or more code review jobs in an agent space.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, BatchGetCodeReviewJobsCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, BatchGetCodeReviewJobsCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // BatchGetCodeReviewJobsInput
 *   codeReviewJobIds: [ // CodeReviewJobIdList // required
 *     "STRING_VALUE",
 *   ],
 *   agentSpaceId: "STRING_VALUE", // required
 * };
 * const command = new BatchGetCodeReviewJobsCommand(input);
 * const response = await client.send(command);
 * // { // BatchGetCodeReviewJobsOutput
 * //   codeReviewJobs: [ // CodeReviewJobList
 * //     { // CodeReviewJob
 * //       codeReviewJobId: "STRING_VALUE",
 * //       codeReviewId: "STRING_VALUE",
 * //       title: "STRING_VALUE",
 * //       overview: "STRING_VALUE",
 * //       status: "IN_PROGRESS" || "STOPPING" || "STOPPED" || "FAILED" || "COMPLETED",
 * //       documents: [ // DocumentList
 * //         { // DocumentInfo
 * //           s3Location: "STRING_VALUE",
 * //           artifactId: "STRING_VALUE",
 * //           integratedDocument: { // IntegratedDocument
 * //             integrationId: "STRING_VALUE", // required
 * //             resourceId: "STRING_VALUE", // required
 * //           },
 * //         },
 * //       ],
 * //       sourceCode: [ // SourceCodeRepositoryList
 * //         { // SourceCodeRepository
 * //           s3Location: "STRING_VALUE",
 * //         },
 * //       ],
 * //       steps: [ // StepList
 * //         { // Step
 * //           name: "PREFLIGHT" || "STATIC_ANALYSIS" || "PENTEST" || "FINALIZING" || "VALIDATION",
 * //           status: "NOT_STARTED" || "IN_PROGRESS" || "COMPLETED" || "FAILED" || "STOPPED",
 * //           createdAt: new Date("TIMESTAMP"),
 * //           updatedAt: new Date("TIMESTAMP"),
 * //         },
 * //       ],
 * //       executionContext: [ // ExecutionContextList
 * //         { // ExecutionContext
 * //           contextType: "ERROR" || "CLIENT_ERROR" || "WARNING" || "INFO",
 * //           context: "STRING_VALUE",
 * //           timestamp: new Date("TIMESTAMP"),
 * //         },
 * //       ],
 * //       serviceRole: "STRING_VALUE",
 * //       logConfig: { // CloudWatchLog
 * //         logGroup: "STRING_VALUE",
 * //         logStream: "STRING_VALUE",
 * //       },
 * //       errorInformation: { // ErrorInformation
 * //         code: "CLIENT_ERROR" || "INTERNAL_ERROR" || "STOPPED_BY_USER",
 * //         message: "STRING_VALUE",
 * //       },
 * //       integratedRepositories: [ // IntegratedRepositoryList
 * //         { // IntegratedRepository
 * //           integrationId: "STRING_VALUE", // required
 * //           providerResourceId: "STRING_VALUE", // required
 * //           branch: "STRING_VALUE",
 * //         },
 * //       ],
 * //       codeRemediationStrategy: "AUTOMATIC" || "DISABLED",
 * //       maxTaskHours: Number("double"),
 * //       createdAt: new Date("TIMESTAMP"),
 * //       updatedAt: new Date("TIMESTAMP"),
 * //     },
 * //   ],
 * //   notFound: [ // CodeReviewJobIdList
 * //     "STRING_VALUE",
 * //   ],
 * // };
 *
 * ```
 *
 * @param BatchGetCodeReviewJobsCommandInput - {@link BatchGetCodeReviewJobsCommandInput}
 * @returns {@link BatchGetCodeReviewJobsCommandOutput}
 * @see {@link BatchGetCodeReviewJobsCommandInput} for command's `input` shape.
 * @see {@link BatchGetCodeReviewJobsCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class BatchGetCodeReviewJobsCommand extends BatchGetCodeReviewJobsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: BatchGetCodeReviewJobsInput;
            output: BatchGetCodeReviewJobsOutput;
        };
        sdk: {
            input: BatchGetCodeReviewJobsCommandInput;
            output: BatchGetCodeReviewJobsCommandOutput;
        };
    };
}
