import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { CreateTargetDomainInput, CreateTargetDomainOutput } from "../models/models_0";
export { __MetadataBearer };
/**
 * @public
 *
 * The input for {@link CreateTargetDomainCommand}.
 */
export interface CreateTargetDomainCommandInput extends CreateTargetDomainInput {
}
/**
 * @public
 *
 * The output of {@link CreateTargetDomainCommand}.
 */
export interface CreateTargetDomainCommandOutput extends CreateTargetDomainOutput, __MetadataBearer {
}
declare const CreateTargetDomainCommand_base: {
    new (input: CreateTargetDomainCommandInput): import("@smithy/core/client").CommandImpl<CreateTargetDomainCommandInput, CreateTargetDomainCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    new (input: CreateTargetDomainCommandInput): import("@smithy/core/client").CommandImpl<CreateTargetDomainCommandInput, CreateTargetDomainCommandOutput, import("..").SecurityAgentClientResolvedConfig, import("..").ServiceInputTypes, import("..").ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/types").EndpointParameterInstructions;
};
/**
 * <p>Creates a new target domain for penetration testing. A target domain is a web domain that must be registered and verified before it can be tested.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecurityAgentClient, CreateTargetDomainCommand } from "@aws-sdk/client-securityagent"; // ES Modules import
 * // const { SecurityAgentClient, CreateTargetDomainCommand } = require("@aws-sdk/client-securityagent"); // CommonJS import
 * // import type { SecurityAgentClientConfig } from "@aws-sdk/client-securityagent";
 * const config = {}; // type is SecurityAgentClientConfig
 * const client = new SecurityAgentClient(config);
 * const input = { // CreateTargetDomainInput
 *   targetDomainName: "STRING_VALUE", // required
 *   verificationMethod: "DNS_TXT" || "HTTP_ROUTE" || "PRIVATE_VPC", // required
 *   tags: { // TagMap
 *     "<keys>": "STRING_VALUE",
 *   },
 * };
 * const command = new CreateTargetDomainCommand(input);
 * const response = await client.send(command);
 * // { // CreateTargetDomainOutput
 * //   targetDomainId: "STRING_VALUE", // required
 * //   domainName: "STRING_VALUE", // required
 * //   verificationStatus: "PENDING" || "VERIFIED" || "FAILED" || "UNREACHABLE", // required
 * //   verificationStatusReason: "STRING_VALUE",
 * //   verificationDetails: { // VerificationDetails
 * //     method: "DNS_TXT" || "HTTP_ROUTE" || "PRIVATE_VPC",
 * //     dnsTxt: { // DnsVerification
 * //       token: "STRING_VALUE",
 * //       dnsRecordName: "STRING_VALUE",
 * //       dnsRecordType: "TXT",
 * //     },
 * //     httpRoute: { // HttpVerification
 * //       token: "STRING_VALUE",
 * //       routePath: "STRING_VALUE",
 * //     },
 * //   },
 * //   createdAt: new Date("TIMESTAMP"),
 * //   verifiedAt: new Date("TIMESTAMP"),
 * // };
 *
 * ```
 *
 * @param CreateTargetDomainCommandInput - {@link CreateTargetDomainCommandInput}
 * @returns {@link CreateTargetDomainCommandOutput}
 * @see {@link CreateTargetDomainCommandInput} for command's `input` shape.
 * @see {@link CreateTargetDomainCommandOutput} for command's `response` shape.
 * @see {@link SecurityAgentClientResolvedConfig | config} for SecurityAgentClient's `config` shape.
 *
 * @throws {@link SecurityAgentServiceException}
 * <p>Base exception class for all service exceptions from SecurityAgent service.</p>
 *
 *
 * @public
 */
export declare class CreateTargetDomainCommand extends CreateTargetDomainCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: CreateTargetDomainInput;
            output: CreateTargetDomainOutput;
        };
        sdk: {
            input: CreateTargetDomainCommandInput;
            output: CreateTargetDomainCommandOutput;
        };
    };
}
