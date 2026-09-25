import { HostHeaderInputConfig, HostHeaderResolvedConfig, UserAgentInputConfig, UserAgentResolvedConfig } from "@aws-sdk/core/client";
import { DefaultsMode as __DefaultsMode, SmithyConfiguration as __SmithyConfiguration, SmithyResolvedConfiguration as __SmithyResolvedConfiguration, Client as __Client } from "@smithy/core/client";
import { RegionInputConfig, RegionResolvedConfig } from "@smithy/core/config";
import { EndpointInputConfig, EndpointResolvedConfig } from "@smithy/core/endpoints";
import { HttpHandlerUserInput as __HttpHandlerUserInput } from "@smithy/core/protocols";
import { RetryInputConfig, RetryResolvedConfig } from "@smithy/core/retry";
import { AwsCredentialIdentityProvider, BodyLengthCalculator as __BodyLengthCalculator, CheckOptionalClientConfig as __CheckOptionalClientConfig, ChecksumConstructor as __ChecksumConstructor, Decoder as __Decoder, Encoder as __Encoder, HashConstructor as __HashConstructor, HttpHandlerOptions as __HttpHandlerOptions, Logger as __Logger, Provider as __Provider, StreamCollector as __StreamCollector, UrlParser as __UrlParser, UserAgent as __UserAgent } from "@smithy/types";
import { HttpAuthSchemeInputConfig, HttpAuthSchemeResolvedConfig } from "./auth/httpAuthSchemeProvider";
import { AddArtifactCommandInput, AddArtifactCommandOutput } from "./commands/AddArtifactCommand";
import { BatchCreateSecurityRequirementsCommandInput, BatchCreateSecurityRequirementsCommandOutput } from "./commands/BatchCreateSecurityRequirementsCommand";
import { BatchDeleteCodeReviewsCommandInput, BatchDeleteCodeReviewsCommandOutput } from "./commands/BatchDeleteCodeReviewsCommand";
import { BatchDeletePentestsCommandInput, BatchDeletePentestsCommandOutput } from "./commands/BatchDeletePentestsCommand";
import { BatchDeleteSecurityRequirementsCommandInput, BatchDeleteSecurityRequirementsCommandOutput } from "./commands/BatchDeleteSecurityRequirementsCommand";
import { BatchDeleteThreatModelsCommandInput, BatchDeleteThreatModelsCommandOutput } from "./commands/BatchDeleteThreatModelsCommand";
import { BatchGetAgentSpacesCommandInput, BatchGetAgentSpacesCommandOutput } from "./commands/BatchGetAgentSpacesCommand";
import { BatchGetArtifactMetadataCommandInput, BatchGetArtifactMetadataCommandOutput } from "./commands/BatchGetArtifactMetadataCommand";
import { BatchGetCodeReviewJobsCommandInput, BatchGetCodeReviewJobsCommandOutput } from "./commands/BatchGetCodeReviewJobsCommand";
import { BatchGetCodeReviewJobTasksCommandInput, BatchGetCodeReviewJobTasksCommandOutput } from "./commands/BatchGetCodeReviewJobTasksCommand";
import { BatchGetCodeReviewsCommandInput, BatchGetCodeReviewsCommandOutput } from "./commands/BatchGetCodeReviewsCommand";
import { BatchGetFindingsCommandInput, BatchGetFindingsCommandOutput } from "./commands/BatchGetFindingsCommand";
import { BatchGetPentestJobsCommandInput, BatchGetPentestJobsCommandOutput } from "./commands/BatchGetPentestJobsCommand";
import { BatchGetPentestJobTasksCommandInput, BatchGetPentestJobTasksCommandOutput } from "./commands/BatchGetPentestJobTasksCommand";
import { BatchGetPentestsCommandInput, BatchGetPentestsCommandOutput } from "./commands/BatchGetPentestsCommand";
import { BatchGetSecurityRequirementsCommandInput, BatchGetSecurityRequirementsCommandOutput } from "./commands/BatchGetSecurityRequirementsCommand";
import { BatchGetTargetDomainsCommandInput, BatchGetTargetDomainsCommandOutput } from "./commands/BatchGetTargetDomainsCommand";
import { BatchGetThreatModelJobsCommandInput, BatchGetThreatModelJobsCommandOutput } from "./commands/BatchGetThreatModelJobsCommand";
import { BatchGetThreatModelJobTasksCommandInput, BatchGetThreatModelJobTasksCommandOutput } from "./commands/BatchGetThreatModelJobTasksCommand";
import { BatchGetThreatModelsCommandInput, BatchGetThreatModelsCommandOutput } from "./commands/BatchGetThreatModelsCommand";
import { BatchGetThreatsCommandInput, BatchGetThreatsCommandOutput } from "./commands/BatchGetThreatsCommand";
import { BatchUpdateSecurityRequirementsCommandInput, BatchUpdateSecurityRequirementsCommandOutput } from "./commands/BatchUpdateSecurityRequirementsCommand";
import { CreateAgentSpaceCommandInput, CreateAgentSpaceCommandOutput } from "./commands/CreateAgentSpaceCommand";
import { CreateApplicationCommandInput, CreateApplicationCommandOutput } from "./commands/CreateApplicationCommand";
import { CreateCodeReviewCommandInput, CreateCodeReviewCommandOutput } from "./commands/CreateCodeReviewCommand";
import { CreateIntegrationCommandInput, CreateIntegrationCommandOutput } from "./commands/CreateIntegrationCommand";
import { CreateMembershipCommandInput, CreateMembershipCommandOutput } from "./commands/CreateMembershipCommand";
import { CreatePentestCommandInput, CreatePentestCommandOutput } from "./commands/CreatePentestCommand";
import { CreatePrivateConnectionCommandInput, CreatePrivateConnectionCommandOutput } from "./commands/CreatePrivateConnectionCommand";
import { CreateSecurityRequirementPackCommandInput, CreateSecurityRequirementPackCommandOutput } from "./commands/CreateSecurityRequirementPackCommand";
import { CreateTargetDomainCommandInput, CreateTargetDomainCommandOutput } from "./commands/CreateTargetDomainCommand";
import { CreateThreatCommandInput, CreateThreatCommandOutput } from "./commands/CreateThreatCommand";
import { CreateThreatModelCommandInput, CreateThreatModelCommandOutput } from "./commands/CreateThreatModelCommand";
import { DeleteAgentSpaceCommandInput, DeleteAgentSpaceCommandOutput } from "./commands/DeleteAgentSpaceCommand";
import { DeleteApplicationCommandInput, DeleteApplicationCommandOutput } from "./commands/DeleteApplicationCommand";
import { DeleteArtifactCommandInput, DeleteArtifactCommandOutput } from "./commands/DeleteArtifactCommand";
import { DeleteIntegrationCommandInput, DeleteIntegrationCommandOutput } from "./commands/DeleteIntegrationCommand";
import { DeleteMembershipCommandInput, DeleteMembershipCommandOutput } from "./commands/DeleteMembershipCommand";
import { DeletePrivateConnectionCommandInput, DeletePrivateConnectionCommandOutput } from "./commands/DeletePrivateConnectionCommand";
import { DeleteSecurityRequirementPackCommandInput, DeleteSecurityRequirementPackCommandOutput } from "./commands/DeleteSecurityRequirementPackCommand";
import { DeleteTargetDomainCommandInput, DeleteTargetDomainCommandOutput } from "./commands/DeleteTargetDomainCommand";
import { DescribePrivateConnectionCommandInput, DescribePrivateConnectionCommandOutput } from "./commands/DescribePrivateConnectionCommand";
import { GetApplicationCommandInput, GetApplicationCommandOutput } from "./commands/GetApplicationCommand";
import { GetArtifactCommandInput, GetArtifactCommandOutput } from "./commands/GetArtifactCommand";
import { GetIntegrationCommandInput, GetIntegrationCommandOutput } from "./commands/GetIntegrationCommand";
import { GetSecurityRequirementPackCommandInput, GetSecurityRequirementPackCommandOutput } from "./commands/GetSecurityRequirementPackCommand";
import { ImportSecurityRequirementsCommandInput, ImportSecurityRequirementsCommandOutput } from "./commands/ImportSecurityRequirementsCommand";
import { InitiateProviderRegistrationCommandInput, InitiateProviderRegistrationCommandOutput } from "./commands/InitiateProviderRegistrationCommand";
import { ListAgentSpacesCommandInput, ListAgentSpacesCommandOutput } from "./commands/ListAgentSpacesCommand";
import { ListApplicationsCommandInput, ListApplicationsCommandOutput } from "./commands/ListApplicationsCommand";
import { ListArtifactsCommandInput, ListArtifactsCommandOutput } from "./commands/ListArtifactsCommand";
import { ListCodeReviewJobsForCodeReviewCommandInput, ListCodeReviewJobsForCodeReviewCommandOutput } from "./commands/ListCodeReviewJobsForCodeReviewCommand";
import { ListCodeReviewJobTasksCommandInput, ListCodeReviewJobTasksCommandOutput } from "./commands/ListCodeReviewJobTasksCommand";
import { ListCodeReviewsCommandInput, ListCodeReviewsCommandOutput } from "./commands/ListCodeReviewsCommand";
import { ListDiscoveredEndpointsCommandInput, ListDiscoveredEndpointsCommandOutput } from "./commands/ListDiscoveredEndpointsCommand";
import { ListFindingsCommandInput, ListFindingsCommandOutput } from "./commands/ListFindingsCommand";
import { ListIntegratedResourcesCommandInput, ListIntegratedResourcesCommandOutput } from "./commands/ListIntegratedResourcesCommand";
import { ListIntegrationsCommandInput, ListIntegrationsCommandOutput } from "./commands/ListIntegrationsCommand";
import { ListMembershipsCommandInput, ListMembershipsCommandOutput } from "./commands/ListMembershipsCommand";
import { ListPentestJobsForPentestCommandInput, ListPentestJobsForPentestCommandOutput } from "./commands/ListPentestJobsForPentestCommand";
import { ListPentestJobTasksCommandInput, ListPentestJobTasksCommandOutput } from "./commands/ListPentestJobTasksCommand";
import { ListPentestsCommandInput, ListPentestsCommandOutput } from "./commands/ListPentestsCommand";
import { ListPrivateConnectionsCommandInput, ListPrivateConnectionsCommandOutput } from "./commands/ListPrivateConnectionsCommand";
import { ListSecurityRequirementPacksCommandInput, ListSecurityRequirementPacksCommandOutput } from "./commands/ListSecurityRequirementPacksCommand";
import { ListSecurityRequirementsCommandInput, ListSecurityRequirementsCommandOutput } from "./commands/ListSecurityRequirementsCommand";
import { ListTagsForResourceCommandInput, ListTagsForResourceCommandOutput } from "./commands/ListTagsForResourceCommand";
import { ListTargetDomainsCommandInput, ListTargetDomainsCommandOutput } from "./commands/ListTargetDomainsCommand";
import { ListThreatModelJobsCommandInput, ListThreatModelJobsCommandOutput } from "./commands/ListThreatModelJobsCommand";
import { ListThreatModelJobTasksCommandInput, ListThreatModelJobTasksCommandOutput } from "./commands/ListThreatModelJobTasksCommand";
import { ListThreatModelsCommandInput, ListThreatModelsCommandOutput } from "./commands/ListThreatModelsCommand";
import { ListThreatsCommandInput, ListThreatsCommandOutput } from "./commands/ListThreatsCommand";
import { StartCodeRemediationCommandInput, StartCodeRemediationCommandOutput } from "./commands/StartCodeRemediationCommand";
import { StartCodeReviewJobCommandInput, StartCodeReviewJobCommandOutput } from "./commands/StartCodeReviewJobCommand";
import { StartPentestJobCommandInput, StartPentestJobCommandOutput } from "./commands/StartPentestJobCommand";
import { StartThreatModelJobCommandInput, StartThreatModelJobCommandOutput } from "./commands/StartThreatModelJobCommand";
import { StopCodeReviewJobCommandInput, StopCodeReviewJobCommandOutput } from "./commands/StopCodeReviewJobCommand";
import { StopPentestJobCommandInput, StopPentestJobCommandOutput } from "./commands/StopPentestJobCommand";
import { StopThreatModelJobCommandInput, StopThreatModelJobCommandOutput } from "./commands/StopThreatModelJobCommand";
import { TagResourceCommandInput, TagResourceCommandOutput } from "./commands/TagResourceCommand";
import { UntagResourceCommandInput, UntagResourceCommandOutput } from "./commands/UntagResourceCommand";
import { UpdateAgentSpaceCommandInput, UpdateAgentSpaceCommandOutput } from "./commands/UpdateAgentSpaceCommand";
import { UpdateApplicationCommandInput, UpdateApplicationCommandOutput } from "./commands/UpdateApplicationCommand";
import { UpdateCodeReviewCommandInput, UpdateCodeReviewCommandOutput } from "./commands/UpdateCodeReviewCommand";
import { UpdateFindingCommandInput, UpdateFindingCommandOutput } from "./commands/UpdateFindingCommand";
import { UpdateIntegratedResourcesCommandInput, UpdateIntegratedResourcesCommandOutput } from "./commands/UpdateIntegratedResourcesCommand";
import { UpdatePentestCommandInput, UpdatePentestCommandOutput } from "./commands/UpdatePentestCommand";
import { UpdatePrivateConnectionCertificateCommandInput, UpdatePrivateConnectionCertificateCommandOutput } from "./commands/UpdatePrivateConnectionCertificateCommand";
import { UpdateSecurityRequirementPackCommandInput, UpdateSecurityRequirementPackCommandOutput } from "./commands/UpdateSecurityRequirementPackCommand";
import { UpdateTargetDomainCommandInput, UpdateTargetDomainCommandOutput } from "./commands/UpdateTargetDomainCommand";
import { UpdateThreatCommandInput, UpdateThreatCommandOutput } from "./commands/UpdateThreatCommand";
import { UpdateThreatModelCommandInput, UpdateThreatModelCommandOutput } from "./commands/UpdateThreatModelCommand";
import { VerifyTargetDomainCommandInput, VerifyTargetDomainCommandOutput } from "./commands/VerifyTargetDomainCommand";
import { ClientInputEndpointParameters, ClientResolvedEndpointParameters, EndpointParameters } from "./endpoint/EndpointParameters";
import { RuntimeExtension, RuntimeExtensionsConfig } from "./runtimeExtensions";
export { __Client };
/**
 * @public
 */
export type ServiceInputTypes = AddArtifactCommandInput | BatchCreateSecurityRequirementsCommandInput | BatchDeleteCodeReviewsCommandInput | BatchDeletePentestsCommandInput | BatchDeleteSecurityRequirementsCommandInput | BatchDeleteThreatModelsCommandInput | BatchGetAgentSpacesCommandInput | BatchGetArtifactMetadataCommandInput | BatchGetCodeReviewJobTasksCommandInput | BatchGetCodeReviewJobsCommandInput | BatchGetCodeReviewsCommandInput | BatchGetFindingsCommandInput | BatchGetPentestJobTasksCommandInput | BatchGetPentestJobsCommandInput | BatchGetPentestsCommandInput | BatchGetSecurityRequirementsCommandInput | BatchGetTargetDomainsCommandInput | BatchGetThreatModelJobTasksCommandInput | BatchGetThreatModelJobsCommandInput | BatchGetThreatModelsCommandInput | BatchGetThreatsCommandInput | BatchUpdateSecurityRequirementsCommandInput | CreateAgentSpaceCommandInput | CreateApplicationCommandInput | CreateCodeReviewCommandInput | CreateIntegrationCommandInput | CreateMembershipCommandInput | CreatePentestCommandInput | CreatePrivateConnectionCommandInput | CreateSecurityRequirementPackCommandInput | CreateTargetDomainCommandInput | CreateThreatCommandInput | CreateThreatModelCommandInput | DeleteAgentSpaceCommandInput | DeleteApplicationCommandInput | DeleteArtifactCommandInput | DeleteIntegrationCommandInput | DeleteMembershipCommandInput | DeletePrivateConnectionCommandInput | DeleteSecurityRequirementPackCommandInput | DeleteTargetDomainCommandInput | DescribePrivateConnectionCommandInput | GetApplicationCommandInput | GetArtifactCommandInput | GetIntegrationCommandInput | GetSecurityRequirementPackCommandInput | ImportSecurityRequirementsCommandInput | InitiateProviderRegistrationCommandInput | ListAgentSpacesCommandInput | ListApplicationsCommandInput | ListArtifactsCommandInput | ListCodeReviewJobTasksCommandInput | ListCodeReviewJobsForCodeReviewCommandInput | ListCodeReviewsCommandInput | ListDiscoveredEndpointsCommandInput | ListFindingsCommandInput | ListIntegratedResourcesCommandInput | ListIntegrationsCommandInput | ListMembershipsCommandInput | ListPentestJobTasksCommandInput | ListPentestJobsForPentestCommandInput | ListPentestsCommandInput | ListPrivateConnectionsCommandInput | ListSecurityRequirementPacksCommandInput | ListSecurityRequirementsCommandInput | ListTagsForResourceCommandInput | ListTargetDomainsCommandInput | ListThreatModelJobTasksCommandInput | ListThreatModelJobsCommandInput | ListThreatModelsCommandInput | ListThreatsCommandInput | StartCodeRemediationCommandInput | StartCodeReviewJobCommandInput | StartPentestJobCommandInput | StartThreatModelJobCommandInput | StopCodeReviewJobCommandInput | StopPentestJobCommandInput | StopThreatModelJobCommandInput | TagResourceCommandInput | UntagResourceCommandInput | UpdateAgentSpaceCommandInput | UpdateApplicationCommandInput | UpdateCodeReviewCommandInput | UpdateFindingCommandInput | UpdateIntegratedResourcesCommandInput | UpdatePentestCommandInput | UpdatePrivateConnectionCertificateCommandInput | UpdateSecurityRequirementPackCommandInput | UpdateTargetDomainCommandInput | UpdateThreatCommandInput | UpdateThreatModelCommandInput | VerifyTargetDomainCommandInput;
/**
 * @public
 */
export type ServiceOutputTypes = AddArtifactCommandOutput | BatchCreateSecurityRequirementsCommandOutput | BatchDeleteCodeReviewsCommandOutput | BatchDeletePentestsCommandOutput | BatchDeleteSecurityRequirementsCommandOutput | BatchDeleteThreatModelsCommandOutput | BatchGetAgentSpacesCommandOutput | BatchGetArtifactMetadataCommandOutput | BatchGetCodeReviewJobTasksCommandOutput | BatchGetCodeReviewJobsCommandOutput | BatchGetCodeReviewsCommandOutput | BatchGetFindingsCommandOutput | BatchGetPentestJobTasksCommandOutput | BatchGetPentestJobsCommandOutput | BatchGetPentestsCommandOutput | BatchGetSecurityRequirementsCommandOutput | BatchGetTargetDomainsCommandOutput | BatchGetThreatModelJobTasksCommandOutput | BatchGetThreatModelJobsCommandOutput | BatchGetThreatModelsCommandOutput | BatchGetThreatsCommandOutput | BatchUpdateSecurityRequirementsCommandOutput | CreateAgentSpaceCommandOutput | CreateApplicationCommandOutput | CreateCodeReviewCommandOutput | CreateIntegrationCommandOutput | CreateMembershipCommandOutput | CreatePentestCommandOutput | CreatePrivateConnectionCommandOutput | CreateSecurityRequirementPackCommandOutput | CreateTargetDomainCommandOutput | CreateThreatCommandOutput | CreateThreatModelCommandOutput | DeleteAgentSpaceCommandOutput | DeleteApplicationCommandOutput | DeleteArtifactCommandOutput | DeleteIntegrationCommandOutput | DeleteMembershipCommandOutput | DeletePrivateConnectionCommandOutput | DeleteSecurityRequirementPackCommandOutput | DeleteTargetDomainCommandOutput | DescribePrivateConnectionCommandOutput | GetApplicationCommandOutput | GetArtifactCommandOutput | GetIntegrationCommandOutput | GetSecurityRequirementPackCommandOutput | ImportSecurityRequirementsCommandOutput | InitiateProviderRegistrationCommandOutput | ListAgentSpacesCommandOutput | ListApplicationsCommandOutput | ListArtifactsCommandOutput | ListCodeReviewJobTasksCommandOutput | ListCodeReviewJobsForCodeReviewCommandOutput | ListCodeReviewsCommandOutput | ListDiscoveredEndpointsCommandOutput | ListFindingsCommandOutput | ListIntegratedResourcesCommandOutput | ListIntegrationsCommandOutput | ListMembershipsCommandOutput | ListPentestJobTasksCommandOutput | ListPentestJobsForPentestCommandOutput | ListPentestsCommandOutput | ListPrivateConnectionsCommandOutput | ListSecurityRequirementPacksCommandOutput | ListSecurityRequirementsCommandOutput | ListTagsForResourceCommandOutput | ListTargetDomainsCommandOutput | ListThreatModelJobTasksCommandOutput | ListThreatModelJobsCommandOutput | ListThreatModelsCommandOutput | ListThreatsCommandOutput | StartCodeRemediationCommandOutput | StartCodeReviewJobCommandOutput | StartPentestJobCommandOutput | StartThreatModelJobCommandOutput | StopCodeReviewJobCommandOutput | StopPentestJobCommandOutput | StopThreatModelJobCommandOutput | TagResourceCommandOutput | UntagResourceCommandOutput | UpdateAgentSpaceCommandOutput | UpdateApplicationCommandOutput | UpdateCodeReviewCommandOutput | UpdateFindingCommandOutput | UpdateIntegratedResourcesCommandOutput | UpdatePentestCommandOutput | UpdatePrivateConnectionCertificateCommandOutput | UpdateSecurityRequirementPackCommandOutput | UpdateTargetDomainCommandOutput | UpdateThreatCommandOutput | UpdateThreatModelCommandOutput | VerifyTargetDomainCommandOutput;
/**
 * @public
 */
export interface ClientDefaults extends Partial<__SmithyConfiguration<__HttpHandlerOptions>> {
    /**
     * The HTTP handler to use or its constructor options. Fetch in browser and Https in Nodejs.
     */
    requestHandler?: __HttpHandlerUserInput;
    /**
     * A constructor for a class implementing the {@link @smithy/types#ChecksumConstructor} interface
     * that computes the SHA-256 HMAC or checksum of a string or binary buffer.
     * @internal
     */
    sha256?: __ChecksumConstructor | __HashConstructor;
    /**
     * The function that will be used to convert strings into HTTP endpoints.
     * @internal
     */
    urlParser?: __UrlParser;
    /**
     * A function that can calculate the length of a request body.
     * @internal
     */
    bodyLengthChecker?: __BodyLengthCalculator;
    /**
     * A function that converts a stream into an array of bytes.
     * @internal
     */
    streamCollector?: __StreamCollector;
    /**
     * The function that will be used to convert a base64-encoded string to a byte array.
     * @internal
     */
    base64Decoder?: __Decoder;
    /**
     * The function that will be used to convert binary data to a base64-encoded string.
     * @internal
     */
    base64Encoder?: __Encoder;
    /**
     * The function that will be used to convert a UTF8-encoded string to a byte array.
     * @internal
     */
    utf8Decoder?: __Decoder;
    /**
     * The function that will be used to convert binary data to a UTF-8 encoded string.
     * @internal
     */
    utf8Encoder?: __Encoder;
    /**
     * The runtime environment.
     * @internal
     */
    runtime?: string;
    /**
     * Disable dynamically changing the endpoint of the client based on the hostPrefix
     * trait of an operation.
     */
    disableHostPrefix?: boolean;
    /**
     * Unique service identifier.
     * @internal
     */
    serviceId?: string;
    /**
     * Enables IPv6/IPv4 dualstack endpoint.
     */
    useDualstackEndpoint?: boolean | __Provider<boolean>;
    /**
     * Enables FIPS compatible endpoints.
     */
    useFipsEndpoint?: boolean | __Provider<boolean>;
    /**
     * The AWS region to which this client will send requests
     */
    region?: string | __Provider<string>;
    /**
     * Setting a client profile is similar to setting a value for the
     * AWS_PROFILE environment variable. Setting a profile on a client
     * in code only affects the single client instance, unlike AWS_PROFILE.
     *
     * When set, and only for environments where an AWS configuration
     * file exists, fields configurable by this file will be retrieved
     * from the specified profile within that file.
     * Conflicting code configuration and environment variables will
     * still have higher priority.
     *
     * For client credential resolution that involves checking the AWS
     * configuration file, the client's profile (this value) will be
     * used unless a different profile is set in the credential
     * provider options.
     *
     */
    profile?: string;
    /**
     * The provider populating default tracking information to be sent with `user-agent`, `x-amz-user-agent` header
     * @internal
     */
    defaultUserAgentProvider?: __Provider<__UserAgent>;
    /**
     * Default credentials provider; Not available in browser runtime.
     * @deprecated
     * @internal
     */
    credentialDefaultProvider?: (input: any) => AwsCredentialIdentityProvider;
    /**
     * Value for how many times a request will be made at most in case of retry.
     */
    maxAttempts?: number | __Provider<number>;
    /**
     * Specifies which retry algorithm to use.
     * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-smithy-util-retry/Enum/RETRY_MODES/
     *
     */
    retryMode?: string | __Provider<string>;
    /**
     * Optional logger for logging debug/info/warn/error.
     */
    logger?: __Logger;
    /**
     * Optional extensions
     */
    extensions?: RuntimeExtension[];
    /**
     * The {@link @smithy/smithy-client#DefaultsMode} that will be used to determine how certain default configuration options are resolved in the SDK.
     */
    defaultsMode?: __DefaultsMode | __Provider<__DefaultsMode>;
}
/**
 * @public
 */
export type SecurityAgentClientConfigType = Partial<__SmithyConfiguration<__HttpHandlerOptions>> & ClientDefaults & UserAgentInputConfig & RetryInputConfig & RegionInputConfig & HostHeaderInputConfig & EndpointInputConfig<EndpointParameters> & HttpAuthSchemeInputConfig & ClientInputEndpointParameters;
/**
 * @public
 *
 *  The configuration interface of SecurityAgentClient class constructor that set the region, credentials and other options.
 */
export interface SecurityAgentClientConfig extends SecurityAgentClientConfigType {
}
/**
 * @public
 */
export type SecurityAgentClientResolvedConfigType = __SmithyResolvedConfiguration<__HttpHandlerOptions> & Required<ClientDefaults> & RuntimeExtensionsConfig & UserAgentResolvedConfig & RetryResolvedConfig & RegionResolvedConfig & HostHeaderResolvedConfig & EndpointResolvedConfig<EndpointParameters> & HttpAuthSchemeResolvedConfig & ClientResolvedEndpointParameters;
/**
 * @public
 *
 *  The resolved configuration interface of SecurityAgentClient class. This is resolved and normalized from the {@link SecurityAgentClientConfig | constructor configuration interface}.
 */
export interface SecurityAgentClientResolvedConfig extends SecurityAgentClientResolvedConfigType {
}
/**
 * <p>AWS Security Agent is a frontier agent that proactively secures your applications throughout the development lifecycle. It conducts automated security reviews tailored to your organizational requirements and delivers context-aware penetration testing on demand. By continuously validating security from design to deployment, AWS Security Agent helps prevent vulnerabilities early across all your environments. Key capabilities include design security review for architecture documents, code security review for pull requests in connected repositories, and on-demand penetration testing that discovers, validates, and remediates security vulnerabilities through tailored multi-step attack scenarios. For more information, see the <a href="https://docs.aws.amazon.com/securityagent/latest/userguide/what-is.html">AWS Security Agent User Guide</a>.</p>
 * @public
 */
export declare class SecurityAgentClient extends __Client<__HttpHandlerOptions, ServiceInputTypes, ServiceOutputTypes, SecurityAgentClientResolvedConfig> {
    /**
     * The resolved configuration of SecurityAgentClient class. This is resolved and normalized from the {@link SecurityAgentClientConfig | constructor configuration interface}.
     */
    readonly config: SecurityAgentClientResolvedConfig;
    constructor(...[configuration]: __CheckOptionalClientConfig<SecurityAgentClientConfig>);
    /**
     * Destroy underlying resources, like sockets. It's usually not necessary to do this.
     * However in Node.js, it's best to explicitly shut down the client's agent when it is no longer needed.
     * Otherwise, sockets might stay open for quite a long time before the server terminates them.
     */
    destroy(): void;
}
