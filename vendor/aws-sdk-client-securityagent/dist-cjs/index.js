const { awsEndpointFunctions, emitWarningIfUnsupportedVersion: emitWarningIfUnsupportedVersion$1, createDefaultUserAgentProvider, NODE_APP_ID_CONFIG_OPTIONS, getAwsRegionExtensionConfiguration, resolveAwsRegionExtensionConfiguration, resolveUserAgentConfig, resolveHostHeaderConfig, getUserAgentPlugin, getHostHeaderPlugin, getLoggerPlugin, getRecursionDetectionPlugin } = require("@aws-sdk/core/client");
const { getHttpAuthSchemeEndpointRuleSetPlugin, DefaultIdentityProviderConfig, getHttpSigningPlugin, createPaginator } = require("@smithy/core");
const { normalizeProvider, getSmithyContext, ServiceException, NoOpLogger, emitWarningIfUnsupportedVersion, loadConfigsForDefaultMode, getDefaultExtensionConfiguration, resolveDefaultRuntimeConfig, Client, makeBuilder, createAggregatedClient } = require("@smithy/core/client");
const { Command: $Command } = require("@smithy/core/client");
exports.$Command = $Command;
exports.__Client = Client;
const { resolveDefaultsModeConfig, loadConfig, NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, NODE_REGION_CONFIG_OPTIONS, NODE_REGION_CONFIG_FILE_OPTIONS, resolveRegionConfig } = require("@smithy/core/config");
const { BinaryDecisionDiagram, EndpointCache, decideEndpoint, customEndpointFunctions, resolveEndpointConfig, getEndpointPlugin } = require("@smithy/core/endpoints");
const { parseUrl, getHttpHandlerExtensionConfiguration, resolveHttpHandlerRuntimeConfig, getContentLengthPlugin } = require("@smithy/core/protocols");
const { DEFAULT_RETRY_MODE, NODE_RETRY_MODE_CONFIG_OPTIONS, NODE_MAX_ATTEMPT_CONFIG_OPTIONS, resolveRetryConfig, getRetryPlugin } = require("@smithy/core/retry");
const { TypeRegistry, getSchemaSerdePlugin } = require("@smithy/core/schema");
const { resolveAwsSdkSigV4Config, AwsSdkSigV4Signer, NODE_AUTH_SCHEME_PREFERENCE_OPTIONS } = require("@aws-sdk/core/httpAuthSchemes");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { toUtf8, fromUtf8, toBase64, fromBase64, calculateBodyLength } = require("@smithy/core/serde");
const { streamCollector, NodeHttpHandler } = require("@smithy/node-http-handler");
const { AwsRestJsonProtocol } = require("@aws-sdk/core/protocols");
const { Sha256 } = require("@smithy/core/checksum");

const defaultSecurityAgentHttpAuthSchemeParametersProvider = async (config, context, input) => {
    return {
        operation: getSmithyContext(context).operation,
        region: await normalizeProvider(config.region)() || (() => {
            throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
        })(),
    };
};
function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
        schemeId: "aws.auth#sigv4",
        signingProperties: {
            name: "securityagent",
            region: authParameters.region,
        },
        propertiesExtractor: (config, context) => ({
            signingProperties: {
                config,
                context,
            },
        }),
    };
}
const defaultSecurityAgentHttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
        default: {
            options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
        }
    }
    return options;
};
const resolveHttpAuthSchemeConfig = (config) => {
    const config_0 = resolveAwsSdkSigV4Config(config);
    return Object.assign(config_0, {
        authSchemePreference: normalizeProvider(config.authSchemePreference ?? []),
    });
};

const resolveClientEndpointParameters = (options) => {
    return Object.assign(options, {
        useFipsEndpoint: options.useFipsEndpoint ?? false,
        defaultSigningName: "securityagent",
    });
};
const commonParams = {
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
};

var version = "3.1138.0";
var packageInfo = {
	version: version};

const a = "isSet", b = { "ref": "Endpoint" }, c = [{ "ref": "Region" }];
const _data = {
    conditions: [
        [a, [b]],
        [a, c],
        ["aws.partition", c, "PartitionResult"],
        ["booleanEquals", [{ ref: "UseFIPS" }, true]]
    ],
    results: [
        [-1],
        [-1, "Invalid Configuration: FIPS and custom endpoint are not supported"],
        [b, {}],
        ["https://securityagent-fips.{Region}.{PartitionResult#dualStackDnsSuffix}", {}],
        ["https://securityagent.{Region}.{PartitionResult#dualStackDnsSuffix}", {}],
        [-1, "Invalid Configuration: Missing Region"]
    ]
};
const root = 2;
const r = 100_000_000;
const nodes = new Int32Array([
    -1, 1, -1,
    0, 6, 3,
    1, 4, r + 5,
    2, 5, r + 5,
    3, r + 3, r + 4,
    3, r + 1, r + 2,
]);
const bdd = BinaryDecisionDiagram.from(nodes, root, _data.conditions, _data.results);

const cache = new EndpointCache({
    size: 50,
    params: ["Endpoint", "Region", "UseFIPS"],
});
const defaultEndpointResolver = (endpointParams, context = {}) => {
    return cache.get(endpointParams, () => decideEndpoint(bdd, {
        endpointParams: endpointParams,
        logger: context.logger,
    }));
};
customEndpointFunctions.aws = awsEndpointFunctions;

class SecurityAgentServiceException extends ServiceException {
    constructor(options) {
        super(options);
        Object.setPrototypeOf(this, SecurityAgentServiceException.prototype);
    }
}

class AccessDeniedException extends SecurityAgentServiceException {
    name = "AccessDeniedException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "AccessDeniedException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, AccessDeniedException.prototype);
    }
}
class InternalServerException extends SecurityAgentServiceException {
    name = "InternalServerException";
    $fault = "server";
    constructor(opts) {
        super({
            name: "InternalServerException",
            $fault: "server",
            ...opts,
        });
        Object.setPrototypeOf(this, InternalServerException.prototype);
    }
}
class ResourceNotFoundException extends SecurityAgentServiceException {
    name = "ResourceNotFoundException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ResourceNotFoundException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ResourceNotFoundException.prototype);
    }
}
class ThrottlingException extends SecurityAgentServiceException {
    name = "ThrottlingException";
    $fault = "client";
    serviceCode;
    quotaCode;
    constructor(opts) {
        super({
            name: "ThrottlingException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ThrottlingException.prototype);
        this.serviceCode = opts.serviceCode;
        this.quotaCode = opts.quotaCode;
    }
}
class ValidationException extends SecurityAgentServiceException {
    name = "ValidationException";
    $fault = "client";
    fieldList;
    constructor(opts) {
        super({
            name: "ValidationException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ValidationException.prototype);
        this.fieldList = opts.fieldList;
    }
}
class ConflictException extends SecurityAgentServiceException {
    name = "ConflictException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ConflictException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ConflictException.prototype);
    }
}
class ServiceQuotaExceededException extends SecurityAgentServiceException {
    name = "ServiceQuotaExceededException";
    $fault = "client";
    constructor(opts) {
        super({
            name: "ServiceQuotaExceededException",
            $fault: "client",
            ...opts,
        });
        Object.setPrototypeOf(this, ServiceQuotaExceededException.prototype);
    }
}

const _A = "Actor";
const _AA = "AddArtifact";
const _AAI = "AddArtifactInput";
const _AAO = "AddArtifactOutput";
const _ADE = "AccessDeniedException";
const _AL = "ActorList";
const _AMI = "ArtifactMetadataItem";
const _AML = "ArtifactMetadataList";
const _AS = "AgentSpace";
const _ASL = "AgentSpaceList";
const _ASLp = "ApplicationSummaryList";
const _ASLr = "ArtifactSummaryList";
const _ASS = "AgentSpaceSummary";
const _ASSL = "AgentSpaceSummaryList";
const _ASp = "ApplicationSummary";
const _ASr = "ArtifactSummary";
const _AT = "AccessToken";
const _AWSR = "AWSResources";
const _Ar = "Artifact";
const _As = "Assets";
const _Au = "Authentication";
const _BCSR = "BatchCreateSecurityRequirements";
const _BCSRI = "BatchCreateSecurityRequirementsInput";
const _BCSRO = "BatchCreateSecurityRequirementsOutput";
const _BCSRR = "BatchCreateSecurityRequirementResult";
const _BCSRRL = "BatchCreateSecurityRequirementResultList";
const _BDCR = "BatchDeleteCodeReviews";
const _BDCRI = "BatchDeleteCodeReviewsInput";
const _BDCRO = "BatchDeleteCodeReviewsOutput";
const _BDP = "BatchDeletePentests";
const _BDPI = "BatchDeletePentestsInput";
const _BDPO = "BatchDeletePentestsOutput";
const _BDSR = "BatchDeleteSecurityRequirements";
const _BDSRI = "BatchDeleteSecurityRequirementsInput";
const _BDSRO = "BatchDeleteSecurityRequirementsOutput";
const _BDTM = "BatchDeleteThreatModels";
const _BDTMI = "BatchDeleteThreatModelsInput";
const _BDTMO = "BatchDeleteThreatModelsOutput";
const _BGAM = "BatchGetArtifactMetadata";
const _BGAMI = "BatchGetArtifactMetadataInput";
const _BGAMO = "BatchGetArtifactMetadataOutput";
const _BGAS = "BatchGetAgentSpaces";
const _BGASI = "BatchGetAgentSpacesInput";
const _BGASO = "BatchGetAgentSpacesOutput";
const _BGCR = "BatchGetCodeReviews";
const _BGCRI = "BatchGetCodeReviewsInput";
const _BGCRJ = "BatchGetCodeReviewJobs";
const _BGCRJI = "BatchGetCodeReviewJobsInput";
const _BGCRJO = "BatchGetCodeReviewJobsOutput";
const _BGCRJT = "BatchGetCodeReviewJobTasks";
const _BGCRJTI = "BatchGetCodeReviewJobTasksInput";
const _BGCRJTO = "BatchGetCodeReviewJobTasksOutput";
const _BGCRO = "BatchGetCodeReviewsOutput";
const _BGF = "BatchGetFindings";
const _BGFI = "BatchGetFindingsInput";
const _BGFO = "BatchGetFindingsOutput";
const _BGP = "BatchGetPentests";
const _BGPI = "BatchGetPentestsInput";
const _BGPJ = "BatchGetPentestJobs";
const _BGPJI = "BatchGetPentestJobsInput";
const _BGPJO = "BatchGetPentestJobsOutput";
const _BGPJT = "BatchGetPentestJobTasks";
const _BGPJTI = "BatchGetPentestJobTasksInput";
const _BGPJTO = "BatchGetPentestJobTasksOutput";
const _BGPO = "BatchGetPentestsOutput";
const _BGSR = "BatchGetSecurityRequirements";
const _BGSRI = "BatchGetSecurityRequirementsInput";
const _BGSRO = "BatchGetSecurityRequirementsOutput";
const _BGSRR = "BatchGetSecurityRequirementResult";
const _BGSRRL = "BatchGetSecurityRequirementResultList";
const _BGT = "BatchGetThreats";
const _BGTD = "BatchGetTargetDomains";
const _BGTDI = "BatchGetTargetDomainsInput";
const _BGTDO = "BatchGetTargetDomainsOutput";
const _BGTI = "BatchGetThreatsInput";
const _BGTM = "BatchGetThreatModels";
const _BGTMI = "BatchGetThreatModelsInput";
const _BGTMJ = "BatchGetThreatModelJobs";
const _BGTMJI = "BatchGetThreatModelJobsInput";
const _BGTMJO = "BatchGetThreatModelJobsOutput";
const _BGTMJT = "BatchGetThreatModelJobTasks";
const _BGTMJTI = "BatchGetThreatModelJobTasksInput";
const _BGTMJTO = "BatchGetThreatModelJobTasksOutput";
const _BGTMO = "BatchGetThreatModelsOutput";
const _BGTO = "BatchGetThreatsOutput";
const _BII = "BitbucketIntegrationInput";
const _BRC = "BitbucketResourceCapabilities";
const _BRM = "BitbucketRepositoryMetadata";
const _BRR = "BitbucketRepositoryResource";
const _BSRE = "BatchSecurityRequirementError";
const _BSREa = "BatchSecurityRequirementErrors";
const _BUSR = "BatchUpdateSecurityRequirements";
const _BUSRI = "BatchUpdateSecurityRequirementsInput";
const _BUSRO = "BatchUpdateSecurityRequirementsOutput";
const _C = "Category";
const _CA = "CreateApplication";
const _CAR = "CreateApplicationRequest";
const _CARr = "CreateApplicationResponse";
const _CAS = "CreateAgentSpace";
const _CASI = "CreateAgentSpaceInput";
const _CASO = "CreateAgentSpaceOutput";
const _CC = "CertificateChain";
const _CCC = "CiCdConfiguration";
const _CCP = "CaCertificatePem";
const _CCR = "CreateCodeReview";
const _CCRI = "CreateCodeReviewInput";
const _CCRO = "CreateCodeReviewOutput";
const _CCS = "CaCertificateSource";
const _CDM = "ConfluenceDocumentMetadata";
const _CDR = "ConfluenceDocumentResource";
const _CE = "ConflictException";
const _CH = "CustomHeader";
const _CHL = "CustomHeaderList";
const _CI = "CreateIntegration";
const _CII = "ConfluenceIntegrationInput";
const _CIIr = "CreateIntegrationInput";
const _CIO = "CreateIntegrationOutput";
const _CL = "CodeLocation";
const _CLL = "CodeLocationList";
const _CLa = "CategoryList";
const _CM = "CreateMembership";
const _CMR = "CreateMembershipRequest";
const _CMRr = "CreateMembershipResponse";
const _CP = "CreatePentest";
const _CPC = "CreatePrivateConnection";
const _CPCI = "CreatePrivateConnectionInput";
const _CPCO = "CreatePrivateConnectionOutput";
const _CPI = "CreatePentestInput";
const _CPO = "CreatePentestOutput";
const _CR = "CodeReview";
const _CRC = "ConfluenceResourceCapabilities";
const _CRJ = "CodeReviewJob";
const _CRJL = "CodeReviewJobList";
const _CRJS = "CodeReviewJobSummary";
const _CRJSL = "CodeReviewJobSummaryList";
const _CRJT = "CodeReviewJobTask";
const _CRJTL = "CodeReviewJobTaskList";
const _CRJTS = "CodeReviewJobTaskSummary";
const _CRJTSL = "CodeReviewJobTaskSummaryList";
const _CRL = "CodeReviewList";
const _CRS = "CodeReviewSettings";
const _CRSL = "CodeReviewSummaryList";
const _CRSo = "CodeReviewSummary";
const _CRT = "CodeRemediationTask";
const _CRTD = "CodeRemediationTaskDetails";
const _CRTDL = "CodeRemediationTaskDetailsList";
const _CSRE = "CreateSecurityRequirementEntry";
const _CSREL = "CreateSecurityRequirementEntryList";
const _CSRP = "CreateSecurityRequirementPack";
const _CSRPI = "CreateSecurityRequirementPackInput";
const _CSRPO = "CreateSecurityRequirementPackOutput";
const _CT = "CreateThreat";
const _CTD = "CreateTargetDomain";
const _CTDI = "CreateTargetDomainInput";
const _CTDO = "CreateTargetDomainOutput";
const _CTI = "CreateThreatInput";
const _CTM = "CreateThreatModel";
const _CTMI = "CreateThreatModelInput";
const _CTMO = "CreateThreatModelOutput";
const _CTO = "CreateThreatOutput";
const _CWL = "CloudWatchLog";
const _DA = "DeleteApplication";
const _DAI = "DeleteArtifactInput";
const _DAO = "DeleteArtifactOutput";
const _DAR = "DeleteApplicationRequest";
const _DAS = "DeleteAgentSpace";
const _DASI = "DeleteAgentSpaceInput";
const _DASO = "DeleteAgentSpaceOutput";
const _DAe = "DeleteArtifact";
const _DCRF = "DeleteCodeReviewFailure";
const _DCRFL = "DeleteCodeReviewFailureList";
const _DE = "DiscoveredEndpoint";
const _DEL = "DiscoveredEndpointList";
const _DI = "DocumentInfo";
const _DII = "DeleteIntegrationInput";
const _DIO = "DeleteIntegrationOutput";
const _DIe = "DeleteIntegration";
const _DL = "DocumentList";
const _DM = "DeleteMembership";
const _DMR = "DeleteMembershipRequest";
const _DMRe = "DeleteMembershipResponse";
const _DPC = "DeletePrivateConnection";
const _DPCI = "DeletePrivateConnectionInput";
const _DPCIe = "DescribePrivateConnectionInput";
const _DPCO = "DeletePrivateConnectionOutput";
const _DPCOe = "DescribePrivateConnectionOutput";
const _DPCe = "DescribePrivateConnection";
const _DPF = "DeletePentestFailure";
const _DPFL = "DeletePentestFailureList";
const _DS = "DiffSource";
const _DSRP = "DeleteSecurityRequirementPack";
const _DSRPI = "DeleteSecurityRequirementPackInput";
const _DSRPO = "DeleteSecurityRequirementPackOutput";
const _DTD = "DeleteTargetDomain";
const _DTDI = "DeleteTargetDomainInput";
const _DTDO = "DeleteTargetDomainOutput";
const _DTMF = "DeleteThreatModelFailure";
const _DTMFL = "DeleteThreatModelFailureList";
const _DV = "DnsVerification";
const _E = "Endpoint";
const _EC = "ExecutionContext";
const _ECL = "ExecutionContextList";
const _EI = "ErrorInformation";
const _EL = "EndpointList";
const _F = "Finding";
const _FL = "FindingList";
const _FS = "FindingSummary";
const _FSL = "FindingSummaryList";
const _GA = "GetApplication";
const _GAI = "GetArtifactInput";
const _GAO = "GetArtifactOutput";
const _GAR = "GetApplicationRequest";
const _GARe = "GetApplicationResponse";
const _GAe = "GetArtifact";
const _GHII = "GitHubIntegrationInput";
const _GHRC = "GitHubResourceCapabilities";
const _GHRM = "GitHubRepositoryMetadata";
const _GHRR = "GitHubRepositoryResource";
const _GI = "GetIntegration";
const _GII = "GetIntegrationInput";
const _GIO = "GetIntegrationOutput";
const _GLII = "GitLabIntegrationInput";
const _GLRC = "GitLabResourceCapabilities";
const _GLRM = "GitLabRepositoryMetadata";
const _GLRR = "GitLabRepositoryResource";
const _GSRP = "GetSecurityRequirementPack";
const _GSRPI = "GetSecurityRequirementPackInput";
const _GSRPO = "GetSecurityRequirementPackOutput";
const _HV = "HttpVerification";
const _ICC = "IdCConfiguration";
const _ID = "IntegratedDocument";
const _IF = "IntegrationFilter";
const _IPR = "InitiateProviderRegistration";
const _IPRI = "InitiateProviderRegistrationInput";
const _IPRO = "InitiateProviderRegistrationOutput";
const _IR = "IntegratedRepository";
const _IRII = "IntegratedResourceInputItem";
const _IRIIL = "IntegratedResourceInputItemList";
const _IRL = "IntegratedRepositoryList";
const _IRM = "IntegratedResourceMetadata";
const _IRS = "IntegratedResourceSummary";
const _IRSL = "IntegratedResourceSummaryList";
const _IRn = "IntegratedResource";
const _IS = "IntegrationSummary";
const _ISE = "InternalServerException";
const _ISL = "IntegrationSummaryList";
const _ISR = "ImportSecurityRequirements";
const _ISRI = "ImportSecurityRequirementsInput";
const _ISRO = "ImportSecurityRequirementsOutput";
const _ISm = "ImportSource";
const _LA = "ListApplications";
const _LAI = "ListArtifactsInput";
const _LAO = "ListArtifactsOutput";
const _LAR = "ListApplicationsRequest";
const _LARi = "ListApplicationsResponse";
const _LAS = "ListAgentSpaces";
const _LASI = "ListAgentSpacesInput";
const _LASO = "ListAgentSpacesOutput";
const _LAi = "ListArtifacts";
const _LCR = "ListCodeReviews";
const _LCRI = "ListCodeReviewsInput";
const _LCRJFCR = "ListCodeReviewJobsForCodeReview";
const _LCRJFCRI = "ListCodeReviewJobsForCodeReviewInput";
const _LCRJFCRO = "ListCodeReviewJobsForCodeReviewOutput";
const _LCRJT = "ListCodeReviewJobTasks";
const _LCRJTI = "ListCodeReviewJobTasksInput";
const _LCRJTO = "ListCodeReviewJobTasksOutput";
const _LCRO = "ListCodeReviewsOutput";
const _LDE = "ListDiscoveredEndpoints";
const _LDEI = "ListDiscoveredEndpointsInput";
const _LDEO = "ListDiscoveredEndpointsOutput";
const _LF = "ListFindings";
const _LFI = "ListFindingsInput";
const _LFO = "ListFindingsOutput";
const _LI = "ListIntegrations";
const _LII = "ListIntegrationsInput";
const _LIO = "ListIntegrationsOutput";
const _LIR = "ListIntegratedResources";
const _LIRI = "ListIntegratedResourcesInput";
const _LIRO = "ListIntegratedResourcesOutput";
const _LL = "LogLocation";
const _LM = "ListMemberships";
const _LMR = "ListMembershipsRequest";
const _LMRi = "ListMembershipsResponse";
const _LP = "ListPentests";
const _LPC = "ListPrivateConnections";
const _LPCI = "ListPrivateConnectionsInput";
const _LPCO = "ListPrivateConnectionsOutput";
const _LPI = "ListPentestsInput";
const _LPJFP = "ListPentestJobsForPentest";
const _LPJFPI = "ListPentestJobsForPentestInput";
const _LPJFPO = "ListPentestJobsForPentestOutput";
const _LPJT = "ListPentestJobTasks";
const _LPJTI = "ListPentestJobTasksInput";
const _LPJTO = "ListPentestJobTasksOutput";
const _LPO = "ListPentestsOutput";
const _LSR = "ListSecurityRequirements";
const _LSRI = "ListSecurityRequirementsInput";
const _LSRO = "ListSecurityRequirementsOutput";
const _LSRP = "ListSecurityRequirementPacks";
const _LSRPF = "ListSecurityRequirementPackFilter";
const _LSRPI = "ListSecurityRequirementPacksInput";
const _LSRPO = "ListSecurityRequirementPacksOutput";
const _LT = "ListThreats";
const _LTD = "ListTargetDomains";
const _LTDI = "ListTargetDomainsInput";
const _LTDO = "ListTargetDomainsOutput";
const _LTFR = "ListTagsForResource";
const _LTFRI = "ListTagsForResourceInput";
const _LTFRO = "ListTagsForResourceOutput";
const _LTI = "ListThreatsInput";
const _LTM = "ListThreatModels";
const _LTMI = "ListThreatModelsInput";
const _LTMJ = "ListThreatModelJobs";
const _LTMJI = "ListThreatModelJobsInput";
const _LTMJO = "ListThreatModelJobsOutput";
const _LTMJT = "ListThreatModelJobTasks";
const _LTMJTI = "ListThreatModelJobTasksInput";
const _LTMJTO = "ListThreatModelJobTasksOutput";
const _LTMO = "ListThreatModelsOutput";
const _LTO = "ListThreatsOutput";
const _MC = "MembershipConfig";
const _MM = "MemberMetadata";
const _MS = "MembershipSummary";
const _MSL = "MembershipSummaryList";
const _NTC = "NetworkTrafficConfig";
const _NTR = "NetworkTrafficRule";
const _NTRL = "NetworkTrafficRuleList";
const _P = "Pentest";
const _PCL = "PrivateConnectionList";
const _PCM = "PrivateConnectionMode";
const _PCS = "PrivateConnectionSummary";
const _PI = "ProviderInput";
const _PJ = "PentestJob";
const _PJL = "PentestJobList";
const _PJS = "PentestJobSummary";
const _PJSL = "PentestJobSummaryList";
const _PL = "PentestList";
const _PRC = "ProviderResourceCapabilities";
const _PS = "PentestSummary";
const _PSL = "PentestSummaryList";
const _RD = "ReportDestination";
const _RNFE = "ResourceNotFoundException";
const _S = "Step";
const _SC = "ScopeChange";
const _SCL = "ScopeChangeList";
const _SCR = "SourceCodeRepository";
const _SCRI = "StartCodeRemediationInput";
const _SCRJ = "StartCodeReviewJob";
const _SCRJI = "StartCodeReviewJobInput";
const _SCRJIt = "StopCodeReviewJobInput";
const _SCRJO = "StartCodeReviewJobOutput";
const _SCRJOt = "StopCodeReviewJobOutput";
const _SCRJt = "StopCodeReviewJob";
const _SCRL = "SourceCodeRepositoryList";
const _SCRO = "StartCodeRemediationOutput";
const _SCRt = "StartCodeRemediation";
const _SEA = "SensitiveEmailAddress";
const _SL = "StepList";
const _SMI = "SelfManagedInput";
const _SMIe = "ServiceManagedInput";
const _SPJ = "StartPentestJob";
const _SPJI = "StartPentestJobInput";
const _SPJIt = "StopPentestJobInput";
const _SPJO = "StartPentestJobOutput";
const _SPJOt = "StopPentestJobOutput";
const _SPJt = "StopPentestJob";
const _SQEE = "ServiceQuotaExceededException";
const _SR = "ScopeResult";
const _SRA = "SecurityRequirementArtifact";
const _SRAL = "SecurityRequirementArtifactList";
const _SRDC = "SecurityRequirementDocumentContent";
const _SRPS = "SecurityRequirementPackSummary";
const _SRPSL = "SecurityRequirementPackSummaryList";
const _SRS = "SecurityRequirementSummary";
const _SRSL = "SecurityRequirementSummaryList";
const _STMJ = "StartThreatModelJob";
const _STMJI = "StartThreatModelJobInput";
const _STMJIt = "StopThreatModelJobInput";
const _STMJO = "StartThreatModelJobOutput";
const _STMJOt = "StopThreatModelJobOutput";
const _STMJt = "StopThreatModelJob";
const _T = "Task";
const _TAS = "ThreatAnchorShape";
const _TCC = "TrustedCaCertificate";
const _TCCL = "TrustedCaCertificateList";
const _TD = "TargetDomain";
const _TDL = "TargetDomainList";
const _TDS = "TargetDomainSummary";
const _TDSL = "TargetDomainSummaryList";
const _TE = "ThrottlingException";
const _TEL = "ThreatEvidenceList";
const _TES = "ThreatEvidenceShape";
const _TL = "TaskList";
const _TLh = "ThreatList";
const _TM = "ThreatModel";
const _TMJ = "ThreatModelJob";
const _TMJL = "ThreatModelJobList";
const _TMJS = "ThreatModelJobSummary";
const _TMJSL = "ThreatModelJobSummaryList";
const _TMJT = "ThreatModelJobTask";
const _TMJTL = "ThreatModelJobTaskList";
const _TMJTS = "ThreatModelJobTaskSummary";
const _TMJTSL = "ThreatModelJobTaskSummaryList";
const _TML = "ThreatModelList";
const _TMS = "ThreatModelSummary";
const _TMSL = "ThreatModelSummaryList";
const _TR = "TagResource";
const _TRI = "TagResourceInput";
const _TRO = "TagResourceOutput";
const _TS = "TaskSummary";
const _TSL = "TaskSummaryList";
const _TSLh = "ThreatSummaryList";
const _TSh = "ThreatSummary";
const _Th = "Threat";
const _UA = "UpdateApplication";
const _UAR = "UpdateApplicationRequest";
const _UARp = "UpdateApplicationResponse";
const _UAS = "UpdateAgentSpace";
const _UASI = "UpdateAgentSpaceInput";
const _UASO = "UpdateAgentSpaceOutput";
const _UC = "UserConfig";
const _UCR = "UpdateCodeReview";
const _UCRI = "UpdateCodeReviewInput";
const _UCRO = "UpdateCodeReviewOutput";
const _UF = "UpdateFinding";
const _UFI = "UpdateFindingInput";
const _UFO = "UpdateFindingOutput";
const _UIR = "UpdateIntegratedResources";
const _UIRI = "UpdateIntegratedResourcesInput";
const _UIRO = "UpdateIntegratedResourcesOutput";
const _UM = "UserMetadata";
const _UP = "UpdatePentest";
const _UPCC = "UpdatePrivateConnectionCertificate";
const _UPCCI = "UpdatePrivateConnectionCertificateInput";
const _UPCCO = "UpdatePrivateConnectionCertificateOutput";
const _UPI = "UpdatePentestInput";
const _UPO = "UpdatePentestOutput";
const _UR = "UntagResource";
const _URI = "UntagResourceInput";
const _URO = "UntagResourceOutput";
const _USRE = "UpdateSecurityRequirementEntry";
const _USREL = "UpdateSecurityRequirementEntryList";
const _USRP = "UpdateSecurityRequirementPack";
const _USRPI = "UpdateSecurityRequirementPackInput";
const _USRPO = "UpdateSecurityRequirementPackOutput";
const _UT = "UpdateThreat";
const _UTD = "UpdateTargetDomain";
const _UTDI = "UpdateTargetDomainInput";
const _UTDO = "UpdateTargetDomainOutput";
const _UTI = "UpdateThreatInput";
const _UTM = "UpdateThreatModel";
const _UTMI = "UpdateThreatModelInput";
const _UTMO = "UpdateThreatModelOutput";
const _UTO = "UpdateThreatOutput";
const _VC = "VpcConfig";
const _VCp = "VpcConfigs";
const _VD = "VerificationDetails";
const _VE = "ValidationException";
const _VEF = "ValidationExceptionField";
const _VEFL = "ValidationExceptionFieldList";
const _VS = "VerificationScript";
const _VSEV = "VerificationScriptEnvVar";
const _VSEVL = "VerificationScriptEnvVarList";
const _VTD = "VerifyTargetDomain";
const _VTDI = "VerifyTargetDomainInput";
const _VTDO = "VerifyTargetDomainOutput";
const _a = "authentication";
const _aC = "artifactContent";
const _aD = "allowedDomains";
const _aI = "artifactId";
const _aIp = "applicationId";
const _aIr = "artifactIds";
const _aML = "artifactMetadataList";
const _aN = "applicationName";
const _aR = "awsResources";
const _aRl = "alignmentRationale";
const _aS = "agentSpaces";
const _aSI = "agentSpaceId";
const _aSIg = "agentSpaceIds";
const _aSS = "agentSpaceSummaries";
const _aSp = "applicationSummaries";
const _aSr = "artifactSummaries";
const _aSt = "attackScript";
const _aT = "artifactType";
const _aTc = "accessType";
const _aTcc = "accessToken";
const _ac = "actors";
const _an = "anchor";
const _ar = "artifact";
const _as = "assets";
const _b = "branch";
const _bCS = "baseCommitSha";
const _bR = "bitbucketRepository";
const _bi = "bitbucket";
const _c = "client";
const _cA = "createdAt";
const _cB = "createdBy";
const _cC = "cicdConfiguration";
const _cD = "createDocument";
const _cDL = "codeDiffLink";
const _cDo = "confluenceDocument";
const _cET = "certificateExpiryTime";
const _cH = "customHeaders";
const _cI = "containerId";
const _cL = "codeLocations";
const _cN = "customerNote";
const _cNa = "categoryName";
const _cR = "codeReviews";
const _cRI = "codeReviewIds";
const _cRIo = "codeReviewId";
const _cRJ = "codeReviewJobs";
const _cRJI = "codeReviewJobIds";
const _cRJIo = "codeReviewJobId";
const _cRJS = "codeReviewJobSummaries";
const _cRJT = "codeReviewJobTasks";
const _cRJTI = "codeReviewJobTaskIds";
const _cRJTS = "codeReviewJobTaskSummaries";
const _cRS = "codeReviewSettings";
const _cRSo = "codeRemediationStrategy";
const _cRSod = "codeReviewSummaries";
const _cRT = "codeRemediationTask";
const _cS = "controlsScanning";
const _cSs = "csrfState";
const _cT = "contextType";
const _cUS = "cleanUpStrategy";
const _cWL = "cloudWatchLog";
const _ca = "categories";
const _cap = "capabilities";
const _ce = "certificate";
const _co = "contents";
const _cod = "code";
const _com = "comments";
const _con = "config";
const _conf = "confidence";
const _confl = "confluence";
const _cont = "context";
const _conte = "content";
const _d = "description";
const _dE = "discoveredEndpoints";
const _dI = "documentId";
const _dKKI = "defaultKmsKeyId";
const _dMS = "disableManagedSkills";
const _dN = "domainName";
const _dNi = "displayName";
const _dR = "dnsResolution";
const _dRN = "dnsRecordName";
const _dRT = "dnsRecordType";
const _dS = "diffSource";
const _dSRN = "deletedSecurityRequirementNames";
const _dT = "dnsTxt";
const _de = "deleted";
const _dec = "decision";
const _do = "domain";
const _doc = "documents";
const _e = "error";
const _eC = "executionContext";
const _eEM = "enableEmailMfa";
const _eET = "executionEndTime";
const _eI = "errorInformation";
const _eP = "excludePaths";
const _eRT = "excludeRiskTypes";
const _eS = "executionStatus";
const _eST = "executionStartTime";
const _eV = "envVars";
const _ef = "effect";
const _em = "email";
const _en = "endpoints";
const _ena = "enabled";
const _er = "errors";
const _ev = "evaluation";
const _evi = "evidence";
const _f = "failed";
const _fD = "fetchDocument";
const _fI = "findingIds";
const _fIi = "findingId";
const _fL = "fieldList";
const _fM = "failureMessage";
const _fN = "fileName";
const _fP = "filePath";
const _fS = "findingsSummaries";
const _fi = "findings";
const _fil = "filter";
const _fo = "format";
const _g = "github";
const _gI = "groupId";
const _gPS = "generalPurposeScanning";
const _gR = "githubRepository";
const _gRi = "gitlabRepository";
const _gi = "gitlab";
const _h = "http";
const _hA = "hostAddress";
const _hCS = "headCommitSha";
const _hE = "httpError";
const _hQ = "httpQuery";
const _hR = "httpRoute";
const _i = "identifier";
const _iA = "impactedAssets";
const _iAA = "idcApplicationArn";
const _iAPE = "ipv4AddressesPerEni";
const _iAT = "ipAddressType";
const _iC = "idcConfiguration";
const _iD = "integratedDocument";
const _iDN = "integrationDisplayName";
const _iG = "impactedGoal";
const _iI = "installationId";
const _iIA = "idcInstanceArn";
const _iIn = "integrationId";
const _iP = "isPrimary";
const _iPn = "inlinePem";
const _iR = "integratedRepositories";
const _iRS = "integratedResourceSummaries";
const _iRa = "iamRoles";
const _iS = "importStatus";
const _iSn = "integrationSummaries";
const _id = "id";
const _in = "input";
const _ins = "instructions";
const _it = "items";
const _jT = "jobType";
const _k = "kind";
const _kKI = "kmsKeyId";
const _l = "label";
const _lC = "leaveComments";
const _lCo = "logConfig";
const _lE = "lineEnd";
const _lFA = "lambdaFunctionArns";
const _lG = "logGroups";
const _lGo = "logGroup";
const _lL = "logsLocation";
const _lS = "logStream";
const _lSi = "lineStart";
const _lT = "logType";
const _lUB = "lastUpdatedBy";
const _m = "message";
const _mFA = "mfaForwardingAddress";
const _mI = "membershipId";
const _mR = "maxResults";
const _mS = "membershipSummaries";
const _mT = "memberType";
const _mTH = "maxTaskHours";
const _mTa = "managementType";
const _me = "metadata";
const _met = "method";
const _mo = "mode";
const _n = "name";
const _nF = "notFound";
const _nT = "nextToken";
const _nTC = "networkTrafficConfig";
const _nTRT = "networkTrafficRuleType";
const _na = "namespace";
const _o = "overview";
const _oFI = "originalFindingId";
const _oN = "organizationName";
const _op = "operation";
const _ow = "owner";
const _p = "pentests";
const _pC = "privateConnections";
const _pCN = "privateConnectionName";
const _pI = "packId";
const _pIa = "pageId";
const _pIac = "packageId";
const _pIar = "parentId";
const _pIe = "pentestIds";
const _pIen = "pentestId";
const _pJ = "pentestJobs";
const _pJI = "pentestJobIds";
const _pJIe = "pentestJobId";
const _pJS = "pentestJobSummaries";
const _pR = "portRanges";
const _pRI = "providerResourceId";
const _pRL = "pullRequestLink";
const _pS = "pentestSummaries";
const _pT = "providerType";
const _pa = "pattern";
const _pat = "path";
const _pr = "provider";
const _pre = "prerequisites";
const _pref = "prefix";
const _qC = "quotaCode";
const _r = "remediation";
const _rA = "roleArn";
const _rAe = "resourceArn";
const _rC = "remediateCode";
const _rCI = "resourceConfigurationId";
const _rD = "reportDestination";
const _rGI = "resourceGatewayId";
const _rI = "resourceId";
const _rJI = "revalidationJobIds";
const _rL = "riskLevel";
const _rN = "repoName";
const _rP = "routePath";
const _rS = "riskScore";
const _rT = "riskType";
const _rTe = "redirectTo";
const _rTes = "resourceType";
const _re = "recommendation";
const _rea = "reason";
const _reas = "reasoning";
const _res = "resource";
const _ro = "role";
const _ru = "rules";
const _s = "smithy.ts.sdk.synthetic.com.amazonaws.securityagent";
const _sA = "secretArns";
const _sAu = "subnetArns";
const _sB = "s3Buckets";
const _sC = "serviceCode";
const _sCc = "scopeChanges";
const _sCo = "sourceCode";
const _sD = "scopeDocs";
const _sFI = "selectedFindingIds";
const _sGA = "securityGroupArns";
const _sGI = "securityGroupIds";
const _sI = "subnetIds";
const _sK = "spaceKey";
const _sL = "s3Location";
const _sM = "serviceManaged";
const _sMe = "selfManaged";
const _sN = "stepName";
const _sO = "systemOverview";
const _sR = "securityRequirements";
const _sRN = "securityRequirementNames";
const _sRNe = "securityRequirementName";
const _sRPS = "securityRequirementPackSummaries";
const _sRS = "securityRequirementSummaries";
const _sRc = "scopeResult";
const _sRe = "serviceRole";
const _sRt = "statusReason";
const _sT = "spaceTitle";
const _sTc = "scriptType";
const _sU = "siteUrl";
const _sUc = "scriptUrl";
const _sUr = "s3Uri";
const _se = "server";
const _sev = "severity";
const _so = "source";
const _st = "state";
const _sta = "status";
const _stat = "statement";
const _ste = "steps";
const _str = "stride";
const _t = "type";
const _tA = "threatAction";
const _tCC = "trustedCaCertificates";
const _tD = "targetDomains";
const _tDI = "targetDomainIds";
const _tDIa = "targetDomainId";
const _tDN = "targetDomainName";
const _tDS = "targetDomainSummaries";
const _tDa = "taskDetails";
const _tE = "targetEndpoint";
const _tH = "taskHours";
const _tI = "taskIds";
const _tIa = "taskId";
const _tIh = "threatIds";
const _tIhr = "threatImpact";
const _tIhre = "threatId";
const _tJI = "threatJobId";
const _tK = "tagKeys";
const _tM = "threatModels";
const _tMI = "threatModelIds";
const _tMIh = "threatModelId";
const _tMJ = "threatModelJobs";
const _tMJI = "threatModelJobIds";
const _tMJIh = "threatModelJobId";
const _tMJS = "threatModelJobSummaries";
const _tMJT = "threatModelJobTasks";
const _tMJTI = "threatModelJobTaskIds";
const _tMJTS = "threatModelJobTaskSummaries";
const _tMS = "threatModelSummaries";
const _tRI = "triggerRunId";
const _tS = "threatSource";
const _tSa = "taskSummaries";
const _tT = "tokenType";
const _tU = "targetUrl";
const _ta = "tasks";
const _tag = "tags";
const _th = "threats";
const _ti = "title";
const _tim = "timestamp";
const _to = "token";
const _u = "uris";
const _uA = "updatedAt";
const _uB = "updatedBy";
const _uD = "updateDocument";
const _uSRN = "updatedSecurityRequirementNames";
const _ur = "uri";
const _us = "username";
const _use = "user";
const _v = "value";
const _vA = "verifiedAt";
const _vAp = "vpcArn";
const _vC = "vpcConfig";
const _vD = "verificationDetails";
const _vI = "vpcId";
const _vM = "validationMode";
const _vMe = "verificationMethod";
const _vN = "vendorName";
const _vS = "verificationStatus";
const _vSR = "verificationStatusReason";
const _vSa = "validationStatus";
const _vSe = "verificationScript";
const _vp = "vpcs";
const _w = "workspace";
const n0 = "com.amazonaws.securityagent";
const _s_registry = new TypeRegistry(_s);
var SecurityAgentServiceException$ = [-3, _s, "SecurityAgentServiceException", 0, [], []];
_s_registry.registerError(SecurityAgentServiceException$, SecurityAgentServiceException);
const n0_registry = new TypeRegistry(n0);
var AccessDeniedException$ = [-3, n0, _ADE,
    { [_e]: _c, [_hE]: 403 },
    [_m],
    [0], 1
];
n0_registry.registerError(AccessDeniedException$, AccessDeniedException);
var ConflictException$ = [-3, n0, _CE,
    { [_e]: _c, [_hE]: 409 },
    [_m],
    [0], 1
];
n0_registry.registerError(ConflictException$, ConflictException);
var InternalServerException$ = [-3, n0, _ISE,
    { [_e]: _se, [_hE]: 500 },
    [_m],
    [0], 1
];
n0_registry.registerError(InternalServerException$, InternalServerException);
var ResourceNotFoundException$ = [-3, n0, _RNFE,
    { [_e]: _c, [_hE]: 404 },
    [_m],
    [0], 1
];
n0_registry.registerError(ResourceNotFoundException$, ResourceNotFoundException);
var ServiceQuotaExceededException$ = [-3, n0, _SQEE,
    { [_e]: _c, [_hE]: 402 },
    [_m],
    [0], 1
];
n0_registry.registerError(ServiceQuotaExceededException$, ServiceQuotaExceededException);
var ThrottlingException$ = [-3, n0, _TE,
    { [_e]: _c, [_hE]: 429 },
    [_m, _sC, _qC],
    [0, 0, 0], 1
];
n0_registry.registerError(ThrottlingException$, ThrottlingException);
var ValidationException$ = [-3, n0, _VE,
    { [_e]: _c },
    [_m, _fL],
    [0, () => ValidationExceptionFieldList], 1
];
n0_registry.registerError(ValidationException$, ValidationException);
const errorTypeRegistries = [
    _s_registry,
    n0_registry,
];
var AccessToken = [0, n0, _AT, 8, 0];
var CaCertificatePem = [0, n0, _CCP, 8, 0];
var CertificateChain = [0, n0, _CC, 8, 0];
var SecurityRequirementDocumentContent = [0, n0, _SRDC, 8, 21];
var SensitiveEmailAddress = [0, n0, _SEA, 8, 0];
var Actor$ = [3, n0, _A,
    0,
    [_i, _u, _a, _d, _eEM, _mFA],
    [0, 64 | 0, () => Authentication$, 0, 2, [() => SensitiveEmailAddress, 0]]
];
var AddArtifactInput$ = [3, n0, _AAI,
    0,
    [_aSI, _aC, _aT, _fN],
    [0, 21, 0, 0], 4
];
var AddArtifactOutput$ = [3, n0, _AAO,
    0,
    [_aI],
    [0], 1
];
var AgentSpace$ = [3, n0, _AS,
    0,
    [_aSI, _n, _d, _aR, _tDI, _cRS, _kKI, _cA, _uA],
    [0, 0, 0, () => AWSResources$, 64 | 0, () => CodeReviewSettings$, 0, 5, 5], 2
];
var AgentSpaceSummary$ = [3, n0, _ASS,
    0,
    [_aSI, _n, _cA, _uA],
    [0, 0, 5, 5], 2
];
var ApplicationSummary$ = [3, n0, _ASp,
    0,
    [_aIp, _aN, _do, _dKKI],
    [0, 0, 0, 0], 3
];
var Artifact$ = [3, n0, _Ar,
    0,
    [_co, _t],
    [0, 0], 2
];
var ArtifactMetadataItem$ = [3, n0, _AMI,
    0,
    [_aSI, _aI, _fN, _uA],
    [0, 0, 0, 5], 4
];
var ArtifactSummary$ = [3, n0, _ASr,
    0,
    [_aI, _fN, _aT],
    [0, 0, 0], 3
];
var Assets$ = [3, n0, _As,
    0,
    [_en, _ac, _doc, _sCo, _iR, _tCC],
    [() => EndpointList, [() => ActorList, 0], () => DocumentList, () => SourceCodeRepositoryList, () => IntegratedRepositoryList, [() => TrustedCaCertificateList, 0]]
];
var Authentication$ = [3, n0, _Au,
    0,
    [_pT, _v],
    [0, 0]
];
var AWSResources$ = [3, n0, _AWSR,
    0,
    [_vp, _lG, _sB, _sA, _lFA, _iRa],
    [() => VpcConfigs, 64 | 0, 64 | 0, 64 | 0, 64 | 0, 64 | 0]
];
var BatchCreateSecurityRequirementResult$ = [3, n0, _BCSRR,
    0,
    [_pI, _n, _d, _do, _ev, _cA, _uA, _r],
    [0, 0, 0, 0, 0, 5, 5, 0], 7
];
var BatchCreateSecurityRequirementsInput$ = [3, n0, _BCSRI,
    0,
    [_pI, _sR],
    [0, () => CreateSecurityRequirementEntryList], 2
];
var BatchCreateSecurityRequirementsOutput$ = [3, n0, _BCSRO,
    0,
    [_sR, _er],
    [() => BatchCreateSecurityRequirementResultList, () => BatchSecurityRequirementErrors], 2
];
var BatchDeleteCodeReviewsInput$ = [3, n0, _BDCRI,
    0,
    [_cRI, _aSI],
    [64 | 0, 0], 2
];
var BatchDeleteCodeReviewsOutput$ = [3, n0, _BDCRO,
    0,
    [_de, _f],
    [64 | 0, () => DeleteCodeReviewFailureList]
];
var BatchDeletePentestsInput$ = [3, n0, _BDPI,
    0,
    [_pIe, _aSI],
    [64 | 0, 0], 2
];
var BatchDeletePentestsOutput$ = [3, n0, _BDPO,
    0,
    [_de, _f],
    [[() => PentestList, 0], () => DeletePentestFailureList]
];
var BatchDeleteSecurityRequirementsInput$ = [3, n0, _BDSRI,
    0,
    [_pI, _sRN],
    [0, 64 | 0], 2
];
var BatchDeleteSecurityRequirementsOutput$ = [3, n0, _BDSRO,
    0,
    [_dSRN, _er],
    [64 | 0, () => BatchSecurityRequirementErrors], 2
];
var BatchDeleteThreatModelsInput$ = [3, n0, _BDTMI,
    0,
    [_tMI, _aSI],
    [64 | 0, 0], 2
];
var BatchDeleteThreatModelsOutput$ = [3, n0, _BDTMO,
    0,
    [_de, _f],
    [64 | 0, () => DeleteThreatModelFailureList]
];
var BatchGetAgentSpacesInput$ = [3, n0, _BGASI,
    0,
    [_aSIg],
    [64 | 0], 1
];
var BatchGetAgentSpacesOutput$ = [3, n0, _BGASO,
    0,
    [_aS, _nF],
    [() => AgentSpaceList, 64 | 0]
];
var BatchGetArtifactMetadataInput$ = [3, n0, _BGAMI,
    0,
    [_aSI, _aIr],
    [0, 64 | 0], 2
];
var BatchGetArtifactMetadataOutput$ = [3, n0, _BGAMO,
    0,
    [_aML],
    [() => ArtifactMetadataList], 1
];
var BatchGetCodeReviewJobsInput$ = [3, n0, _BGCRJI,
    0,
    [_cRJI, _aSI],
    [64 | 0, 0], 2
];
var BatchGetCodeReviewJobsOutput$ = [3, n0, _BGCRJO,
    0,
    [_cRJ, _nF],
    [() => CodeReviewJobList, 64 | 0]
];
var BatchGetCodeReviewJobTasksInput$ = [3, n0, _BGCRJTI,
    0,
    [_aSI, _cRJTI],
    [0, 64 | 0], 2
];
var BatchGetCodeReviewJobTasksOutput$ = [3, n0, _BGCRJTO,
    0,
    [_cRJT, _nF],
    [() => CodeReviewJobTaskList, 64 | 0]
];
var BatchGetCodeReviewsInput$ = [3, n0, _BGCRI,
    0,
    [_cRI, _aSI],
    [64 | 0, 0], 2
];
var BatchGetCodeReviewsOutput$ = [3, n0, _BGCRO,
    0,
    [_cR, _nF],
    [[() => CodeReviewList, 0], 64 | 0]
];
var BatchGetFindingsInput$ = [3, n0, _BGFI,
    0,
    [_fI, _aSI],
    [64 | 0, 0], 2
];
var BatchGetFindingsOutput$ = [3, n0, _BGFO,
    0,
    [_fi, _nF],
    [() => FindingList, 64 | 0]
];
var BatchGetPentestJobsInput$ = [3, n0, _BGPJI,
    0,
    [_pJI, _aSI],
    [64 | 0, 0], 2
];
var BatchGetPentestJobsOutput$ = [3, n0, _BGPJO,
    0,
    [_pJ, _nF],
    [[() => PentestJobList, 0], 64 | 0]
];
var BatchGetPentestJobTasksInput$ = [3, n0, _BGPJTI,
    0,
    [_aSI, _tI],
    [0, 64 | 0], 2
];
var BatchGetPentestJobTasksOutput$ = [3, n0, _BGPJTO,
    0,
    [_ta, _nF],
    [() => TaskList, 64 | 0]
];
var BatchGetPentestsInput$ = [3, n0, _BGPI,
    0,
    [_pIe, _aSI],
    [64 | 0, 0], 2
];
var BatchGetPentestsOutput$ = [3, n0, _BGPO,
    0,
    [_p, _nF],
    [[() => PentestList, 0], 64 | 0]
];
var BatchGetSecurityRequirementResult$ = [3, n0, _BGSRR,
    0,
    [_pI, _n, _d, _do, _ev, _cA, _uA, _r],
    [0, 0, 0, 0, 0, 5, 5, 0], 7
];
var BatchGetSecurityRequirementsInput$ = [3, n0, _BGSRI,
    0,
    [_pI, _sRN],
    [0, 64 | 0], 2
];
var BatchGetSecurityRequirementsOutput$ = [3, n0, _BGSRO,
    0,
    [_sR, _er],
    [() => BatchGetSecurityRequirementResultList, () => BatchSecurityRequirementErrors], 2
];
var BatchGetTargetDomainsInput$ = [3, n0, _BGTDI,
    0,
    [_tDI],
    [64 | 0], 1
];
var BatchGetTargetDomainsOutput$ = [3, n0, _BGTDO,
    0,
    [_tD, _nF],
    [() => TargetDomainList, 64 | 0]
];
var BatchGetThreatModelJobsInput$ = [3, n0, _BGTMJI,
    0,
    [_tMJI, _aSI],
    [64 | 0, 0], 2
];
var BatchGetThreatModelJobsOutput$ = [3, n0, _BGTMJO,
    0,
    [_tMJ, _nF],
    [() => ThreatModelJobList, 64 | 0]
];
var BatchGetThreatModelJobTasksInput$ = [3, n0, _BGTMJTI,
    0,
    [_aSI, _tMJTI],
    [0, 64 | 0], 2
];
var BatchGetThreatModelJobTasksOutput$ = [3, n0, _BGTMJTO,
    0,
    [_tMJT, _nF],
    [() => ThreatModelJobTaskList, 64 | 0]
];
var BatchGetThreatModelsInput$ = [3, n0, _BGTMI,
    0,
    [_tMI, _aSI],
    [64 | 0, 0], 2
];
var BatchGetThreatModelsOutput$ = [3, n0, _BGTMO,
    0,
    [_tM, _nF],
    [[() => ThreatModelList, 0], 64 | 0]
];
var BatchGetThreatsInput$ = [3, n0, _BGTI,
    0,
    [_tIh, _aSI],
    [64 | 0, 0], 2
];
var BatchGetThreatsOutput$ = [3, n0, _BGTO,
    0,
    [_th, _nF],
    [() => ThreatList, 64 | 0]
];
var BatchSecurityRequirementError$ = [3, n0, _BSRE,
    0,
    [_sRNe, _cod, _m],
    [0, 0, 0], 3
];
var BatchUpdateSecurityRequirementsInput$ = [3, n0, _BUSRI,
    0,
    [_pI, _sR],
    [0, () => UpdateSecurityRequirementEntryList], 2
];
var BatchUpdateSecurityRequirementsOutput$ = [3, n0, _BUSRO,
    0,
    [_uSRN, _er],
    [64 | 0, () => BatchSecurityRequirementErrors], 2
];
var BitbucketIntegrationInput$ = [3, n0, _BII,
    0,
    [_iI, _w, _cod, _st],
    [0, 0, 0, 0], 4
];
var BitbucketRepositoryMetadata$ = [3, n0, _BRM,
    0,
    [_n, _pRI, _w, _aTc],
    [0, 0, 0, 0], 3
];
var BitbucketRepositoryResource$ = [3, n0, _BRR,
    0,
    [_n, _w],
    [0, 0], 2
];
var BitbucketResourceCapabilities$ = [3, n0, _BRC,
    0,
    [_lC, _rC],
    [2, 2]
];
var Category$ = [3, n0, _C,
    0,
    [_n, _iP],
    [0, 2]
];
var CiCdConfiguration$ = [3, n0, _CCC,
    0,
    [_ena],
    [2]
];
var CloudWatchLog$ = [3, n0, _CWL,
    0,
    [_lGo, _lS],
    [0, 0]
];
var CodeLocation$ = [3, n0, _CL,
    0,
    [_fP, _lSi, _lE, _l],
    [0, 1, 1, 0], 1
];
var CodeRemediationTask$ = [3, n0, _CRT,
    0,
    [_sta, _sRt, _tDa],
    [0, 0, () => CodeRemediationTaskDetailsList], 1
];
var CodeRemediationTaskDetails$ = [3, n0, _CRTD,
    0,
    [_rN, _cDL, _pRL],
    [0, 0, 0]
];
var CodeReview$ = [3, n0, _CR,
    0,
    [_cRIo, _aSI, _ti, _as, _sRe, _lCo, _cRSo, _vM, _mTH, _cA, _uA],
    [0, 0, 0, [() => Assets$, 0], 0, () => CloudWatchLog$, 0, 0, 1, 5, 5], 4
];
var CodeReviewJob$ = [3, n0, _CRJ,
    0,
    [_cRJIo, _cRIo, _ti, _o, _sta, _doc, _sCo, _ste, _eC, _sRe, _lCo, _eI, _iR, _cRSo, _mTH, _cA, _uA],
    [0, 0, 0, 0, 0, () => DocumentList, () => SourceCodeRepositoryList, () => StepList, () => ExecutionContextList, 0, () => CloudWatchLog$, () => ErrorInformation$, () => IntegratedRepositoryList, 0, 1, 5, 5]
];
var CodeReviewJobSummary$ = [3, n0, _CRJS,
    0,
    [_cRJIo, _cRIo, _ti, _sta, _cA, _uA],
    [0, 0, 0, 0, 5, 5], 2
];
var CodeReviewJobTask$ = [3, n0, _CRJT,
    0,
    [_tIa, _cRIo, _cRJIo, _aSI, _ti, _d, _ca, _rT, _eS, _lL, _cA, _uA],
    [0, 0, 0, 0, 0, 0, () => CategoryList, 0, 0, () => LogLocation$, 5, 5], 1
];
var CodeReviewJobTaskSummary$ = [3, n0, _CRJTS,
    0,
    [_tIa, _cRIo, _cRJIo, _aSI, _ti, _rT, _eS, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, 5, 5], 1
];
var CodeReviewSettings$ = [3, n0, _CRS,
    0,
    [_cS, _gPS],
    [2, 2], 2
];
var CodeReviewSummary$ = [3, n0, _CRSo,
    0,
    [_cRIo, _aSI, _ti, _cA, _uA],
    [0, 0, 0, 5, 5], 3
];
var ConfluenceDocumentMetadata$ = [3, n0, _CDM,
    0,
    [_n, _pRI, _sK, _pIa, _ti, _sT],
    [0, 0, 0, 0, 0, 0], 4
];
var ConfluenceDocumentResource$ = [3, n0, _CDR,
    0,
    [_n, _sK, _pIa, _ti, _sT],
    [0, 0, 0, 0, 0], 3
];
var ConfluenceIntegrationInput$ = [3, n0, _CII,
    0,
    [_iI, _cod, _st, _sU],
    [0, 0, 0, 0], 4
];
var ConfluenceResourceCapabilities$ = [3, n0, _CRC,
    0,
    [_fD, _cD, _uD],
    [2, 2, 2]
];
var CreateAgentSpaceInput$ = [3, n0, _CASI,
    0,
    [_n, _d, _aR, _tDI, _cRS, _kKI, _tag],
    [0, 0, () => AWSResources$, 64 | 0, () => CodeReviewSettings$, 0, 128 | 0], 1
];
var CreateAgentSpaceOutput$ = [3, n0, _CASO,
    0,
    [_aSI, _n, _d, _aR, _tDI, _cRS, _kKI, _cA, _uA],
    [0, 0, 0, () => AWSResources$, 64 | 0, () => CodeReviewSettings$, 0, 5, 5], 2
];
var CreateApplicationRequest$ = [3, n0, _CAR,
    0,
    [_iIA, _rA, _dKKI, _tag],
    [0, 0, 0, 128 | 0]
];
var CreateApplicationResponse$ = [3, n0, _CARr,
    0,
    [_aIp],
    [0], 1
];
var CreateCodeReviewInput$ = [3, n0, _CCRI,
    0,
    [_ti, _aSI, _as, _sRe, _lCo, _cRSo, _vM, _mTH],
    [0, 0, [() => Assets$, 0], 0, () => CloudWatchLog$, 0, 0, 1], 3
];
var CreateCodeReviewOutput$ = [3, n0, _CCRO,
    0,
    [_cRIo, _ti, _cA, _uA, _as, _sRe, _lCo, _aSI, _cRSo, _vM, _mTH],
    [0, 0, 5, 5, [() => Assets$, 0], 0, () => CloudWatchLog$, 0, 0, 0, 1], 1
];
var CreateIntegrationInput$ = [3, n0, _CIIr,
    0,
    [_pr, _in, _iDN, _kKI, _tag, _pCN],
    [0, [() => ProviderInput$, 0], 0, 0, 128 | 0, 0], 3
];
var CreateIntegrationOutput$ = [3, n0, _CIO,
    0,
    [_iIn],
    [0], 1
];
var CreateMembershipRequest$ = [3, n0, _CMR,
    0,
    [_aIp, _aSI, _mI, _mT, _con],
    [0, 0, 0, 0, () => MembershipConfig$], 4
];
var CreateMembershipResponse$ = [3, n0, _CMRr,
    0,
    [],
    []
];
var CreatePentestInput$ = [3, n0, _CPI,
    0,
    [_ti, _aSI, _as, _eRT, _sRe, _lCo, _vC, _nTC, _cRSo, _dMS, _mTH, _cC],
    [0, 0, [() => Assets$, 0], 64 | 0, 0, () => CloudWatchLog$, () => VpcConfig$, () => NetworkTrafficConfig$, 0, 64 | 0, 1, () => CiCdConfiguration$], 2
];
var CreatePentestOutput$ = [3, n0, _CPO,
    0,
    [_pIen, _ti, _cA, _uA, _as, _eRT, _sRe, _lCo, _aSI, _cC],
    [0, 0, 5, 5, [() => Assets$, 0], 64 | 0, 0, () => CloudWatchLog$, 0, () => CiCdConfiguration$]
];
var CreatePrivateConnectionInput$ = [3, n0, _CPCI,
    0,
    [_pCN, _mo, _tag],
    [0, [() => PrivateConnectionMode$, 0], 128 | 0], 2
];
var CreatePrivateConnectionOutput$ = [3, n0, _CPCO,
    0,
    [_n, _t, _sta, _rGI, _hA, _vI, _rCI, _cET, _dR, _fM, _tag],
    [0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 128 | 0], 3
];
var CreateSecurityRequirementEntry$ = [3, n0, _CSRE,
    0,
    [_n, _d, _do, _ev, _r],
    [0, 0, 0, 0, 0], 4
];
var CreateSecurityRequirementPackInput$ = [3, n0, _CSRPI,
    0,
    [_n, _d, _sta, _kKI, _tag],
    [0, 0, 0, 0, 128 | 0], 1
];
var CreateSecurityRequirementPackOutput$ = [3, n0, _CSRPO,
    0,
    [_pI, _sta, _kKI],
    [0, 0, 0], 2
];
var CreateTargetDomainInput$ = [3, n0, _CTDI,
    0,
    [_tDN, _vMe, _tag],
    [0, 0, 128 | 0], 2
];
var CreateTargetDomainOutput$ = [3, n0, _CTDO,
    0,
    [_tDIa, _dN, _vS, _vSR, _vD, _cA, _vA],
    [0, 0, 0, 0, () => VerificationDetails$, 5, 5], 3
];
var CreateThreatInput$ = [3, n0, _CTI,
    0,
    [_aSI, _tJI, _ti, _stat, _sev, _com, _str, _tS, _pre, _tA, _tIhr, _iG, _iA, _an, _evi, _re],
    [0, 0, 0, 0, 0, 0, 64 | 0, 0, 0, 0, 0, 64 | 0, 64 | 0, () => ThreatAnchorShape$, () => ThreatEvidenceList, 0], 2
];
var CreateThreatModelInput$ = [3, n0, _CTMI,
    0,
    [_ti, _aSI, _sRe, _d, _as, _sD, _lCo, _rD],
    [0, 0, 0, 0, [() => Assets$, 0], () => DocumentList, () => CloudWatchLog$, () => ReportDestination$], 3
];
var CreateThreatModelOutput$ = [3, n0, _CTMO,
    0,
    [_tMIh, _ti, _aSI, _d, _as, _sD, _sRe, _lCo, _cA, _uA],
    [0, 0, 0, 0, [() => Assets$, 0], () => DocumentList, 0, () => CloudWatchLog$, 5, 5], 1
];
var CreateThreatOutput$ = [3, n0, _CTO,
    0,
    [_tIhre, _tJI, _ti, _stat, _sev, _sta, _com, _str, _tS, _pre, _tA, _tIhr, _iG, _iA, _an, _evi, _re, _cB, _uB, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, 64 | 0, 0, 0, 0, 0, 64 | 0, 64 | 0, () => ThreatAnchorShape$, () => ThreatEvidenceList, 0, 0, 0, 5, 5], 2
];
var CustomHeader$ = [3, n0, _CH,
    0,
    [_n, _v],
    [0, 0]
];
var DeleteAgentSpaceInput$ = [3, n0, _DASI,
    0,
    [_aSI],
    [0], 1
];
var DeleteAgentSpaceOutput$ = [3, n0, _DASO,
    0,
    [_aSI],
    [0]
];
var DeleteApplicationRequest$ = [3, n0, _DAR,
    0,
    [_aIp],
    [0], 1
];
var DeleteArtifactInput$ = [3, n0, _DAI,
    0,
    [_aSI, _aI],
    [0, 0], 2
];
var DeleteArtifactOutput$ = [3, n0, _DAO,
    0,
    [],
    []
];
var DeleteCodeReviewFailure$ = [3, n0, _DCRF,
    0,
    [_cRIo, _rea],
    [0, 0]
];
var DeleteIntegrationInput$ = [3, n0, _DII,
    0,
    [_iIn],
    [0], 1
];
var DeleteIntegrationOutput$ = [3, n0, _DIO,
    0,
    [],
    []
];
var DeleteMembershipRequest$ = [3, n0, _DMR,
    0,
    [_aIp, _aSI, _mI, _mT],
    [0, 0, 0, 0], 3
];
var DeleteMembershipResponse$ = [3, n0, _DMRe,
    0,
    [],
    []
];
var DeletePentestFailure$ = [3, n0, _DPF,
    0,
    [_pIen, _rea],
    [0, 0]
];
var DeletePrivateConnectionInput$ = [3, n0, _DPCI,
    0,
    [_pCN],
    [0], 1
];
var DeletePrivateConnectionOutput$ = [3, n0, _DPCO,
    0,
    [_n, _t, _sta, _rGI, _hA, _vI, _rCI, _cET, _dR, _fM, _tag],
    [0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 128 | 0], 3
];
var DeleteSecurityRequirementPackInput$ = [3, n0, _DSRPI,
    0,
    [_pI],
    [0], 1
];
var DeleteSecurityRequirementPackOutput$ = [3, n0, _DSRPO,
    0,
    [],
    []
];
var DeleteTargetDomainInput$ = [3, n0, _DTDI,
    0,
    [_tDIa],
    [0], 1
];
var DeleteTargetDomainOutput$ = [3, n0, _DTDO,
    0,
    [_tDIa],
    [0]
];
var DeleteThreatModelFailure$ = [3, n0, _DTMF,
    0,
    [_tMIh, _rea],
    [0, 0]
];
var DescribePrivateConnectionInput$ = [3, n0, _DPCIe,
    0,
    [_pCN],
    [0], 1
];
var DescribePrivateConnectionOutput$ = [3, n0, _DPCOe,
    0,
    [_n, _t, _sta, _rGI, _hA, _vI, _rCI, _cET, _dR, _fM, _tag],
    [0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 128 | 0], 3
];
var DiscoveredEndpoint$ = [3, n0, _DE,
    0,
    [_ur, _pJIe, _tIa, _aSI, _evi, _op, _d],
    [0, 0, 0, 0, 0, 0, 0], 4
];
var DnsVerification$ = [3, n0, _DV,
    0,
    [_to, _dRN, _dRT],
    [0, 0, 0]
];
var DocumentInfo$ = [3, n0, _DI,
    0,
    [_sL, _aI, _iD],
    [0, 0, () => IntegratedDocument$]
];
var Endpoint$ = [3, n0, _E,
    0,
    [_ur],
    [0]
];
var ErrorInformation$ = [3, n0, _EI,
    0,
    [_cod, _m],
    [0, 0]
];
var ExecutionContext$ = [3, n0, _EC,
    0,
    [_cT, _cont, _tim],
    [0, 0, 5]
];
var Finding$ = [3, n0, _F,
    0,
    [_fIi, _aSI, _pIen, _pJIe, _cRIo, _cRJIo, _tIa, _n, _d, _sta, _rT, _rL, _rS, _reas, _conf, _vSa, _aSt, _cRT, _lUB, _cN, _cL, _vSe, _aRl, _rJI, _oFI, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, () => CodeRemediationTask$, 0, 0, () => CodeLocationList, () => VerificationScript$, 0, 64 | 0, 0, 5, 5], 2
];
var FindingSummary$ = [3, n0, _FS,
    0,
    [_fIi, _aSI, _pIen, _pJIe, _cRIo, _cRJIo, _n, _sta, _rT, _rL, _conf, _vSa, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5], 2
];
var GetApplicationRequest$ = [3, n0, _GAR,
    0,
    [_aIp],
    [0], 1
];
var GetApplicationResponse$ = [3, n0, _GARe,
    0,
    [_aIp, _do, _aN, _iC, _rA, _dKKI],
    [0, 0, 0, () => IdCConfiguration$, 0, 0], 2
];
var GetArtifactInput$ = [3, n0, _GAI,
    0,
    [_aSI, _aI],
    [0, 0], 2
];
var GetArtifactOutput$ = [3, n0, _GAO,
    0,
    [_aSI, _aI, _ar, _fN, _uA],
    [0, 0, () => Artifact$, 0, 5], 5
];
var GetIntegrationInput$ = [3, n0, _GII,
    0,
    [_iIn],
    [0], 1
];
var GetIntegrationOutput$ = [3, n0, _GIO,
    0,
    [_iIn, _iI, _pr, _pT, _dNi, _kKI, _tU, _pCN],
    [0, 0, 0, 0, 0, 0, 0, 0], 4
];
var GetSecurityRequirementPackInput$ = [3, n0, _GSRPI,
    0,
    [_pI],
    [0], 1
];
var GetSecurityRequirementPackOutput$ = [3, n0, _GSRPO,
    0,
    [_pI, _n, _mTa, _sta, _cA, _uA, _d, _vN, _iS, _kKI],
    [0, 0, 0, 0, 5, 5, 0, 0, 0, 0], 6
];
var GitHubIntegrationInput$ = [3, n0, _GHII,
    0,
    [_cod, _st, _oN, _tU, _iI],
    [0, 0, 0, 0, 0], 2
];
var GitHubRepositoryMetadata$ = [3, n0, _GHRM,
    0,
    [_n, _pRI, _ow, _aTc],
    [0, 0, 0, 0], 3
];
var GitHubRepositoryResource$ = [3, n0, _GHRR,
    0,
    [_n, _ow],
    [0, 0], 2
];
var GitHubResourceCapabilities$ = [3, n0, _GHRC,
    0,
    [_lC, _rC],
    [2, 2]
];
var GitLabIntegrationInput$ = [3, n0, _GLII,
    0,
    [_aTcc, _tT, _tU, _gI],
    [[() => AccessToken, 0], 0, 0, 0], 2
];
var GitLabRepositoryMetadata$ = [3, n0, _GLRM,
    0,
    [_n, _pRI, _na, _aTc],
    [0, 0, 0, 0], 3
];
var GitLabRepositoryResource$ = [3, n0, _GLRR,
    0,
    [_n, _na],
    [0, 0], 2
];
var GitLabResourceCapabilities$ = [3, n0, _GLRC,
    0,
    [_lC, _rC],
    [2, 2]
];
var HttpVerification$ = [3, n0, _HV,
    0,
    [_to, _rP],
    [0, 0]
];
var IdCConfiguration$ = [3, n0, _ICC,
    0,
    [_iAA, _iIA],
    [0, 0]
];
var ImportSecurityRequirementsInput$ = [3, n0, _ISRI,
    0,
    [_pI, _in],
    [0, [() => ImportSource$, 0]], 2
];
var ImportSecurityRequirementsOutput$ = [3, n0, _ISRO,
    0,
    [_pI, _iS],
    [0, 0], 2
];
var InitiateProviderRegistrationInput$ = [3, n0, _IPRI,
    0,
    [_pr],
    [0], 1
];
var InitiateProviderRegistrationOutput$ = [3, n0, _IPRO,
    0,
    [_rTe, _cSs],
    [0, 0], 2
];
var IntegratedDocument$ = [3, n0, _ID,
    0,
    [_iIn, _rI],
    [0, 0], 2
];
var IntegratedRepository$ = [3, n0, _IR,
    0,
    [_iIn, _pRI, _b],
    [0, 0, 0], 2
];
var IntegratedResourceInputItem$ = [3, n0, _IRII,
    0,
    [_res, _cap],
    [() => IntegratedResource$, () => ProviderResourceCapabilities$], 1
];
var IntegratedResourceSummary$ = [3, n0, _IRS,
    0,
    [_iIn, _res, _cap],
    [0, () => IntegratedResourceMetadata$, () => ProviderResourceCapabilities$], 2
];
var IntegrationSummary$ = [3, n0, _IS,
    0,
    [_iIn, _iI, _pr, _pT, _dNi, _tU, _pCN],
    [0, 0, 0, 0, 0, 0, 0], 5
];
var ListAgentSpacesInput$ = [3, n0, _LASI,
    0,
    [_nT, _mR],
    [0, 1]
];
var ListAgentSpacesOutput$ = [3, n0, _LASO,
    0,
    [_aSS, _nT],
    [() => AgentSpaceSummaryList, 0]
];
var ListApplicationsRequest$ = [3, n0, _LAR,
    0,
    [_nT, _mR],
    [0, 1]
];
var ListApplicationsResponse$ = [3, n0, _LARi,
    0,
    [_aSp, _nT],
    [() => ApplicationSummaryList, 0], 1
];
var ListArtifactsInput$ = [3, n0, _LAI,
    0,
    [_aSI, _nT, _mR],
    [0, 0, 1], 1
];
var ListArtifactsOutput$ = [3, n0, _LAO,
    0,
    [_aSr, _nT],
    [() => ArtifactSummaryList, 0], 1
];
var ListCodeReviewJobsForCodeReviewInput$ = [3, n0, _LCRJFCRI,
    0,
    [_cRIo, _aSI, _mR, _nT],
    [0, 0, 1, 0], 2
];
var ListCodeReviewJobsForCodeReviewOutput$ = [3, n0, _LCRJFCRO,
    0,
    [_cRJS, _nT],
    [() => CodeReviewJobSummaryList, 0]
];
var ListCodeReviewJobTasksInput$ = [3, n0, _LCRJTI,
    0,
    [_aSI, _mR, _cRJIo, _sN, _cNa, _nT],
    [0, 1, 0, 0, 0, 0], 1
];
var ListCodeReviewJobTasksOutput$ = [3, n0, _LCRJTO,
    0,
    [_cRJTS, _nT],
    [() => CodeReviewJobTaskSummaryList, 0]
];
var ListCodeReviewsInput$ = [3, n0, _LCRI,
    0,
    [_aSI, _mR, _nT],
    [0, 1, 0], 1
];
var ListCodeReviewsOutput$ = [3, n0, _LCRO,
    0,
    [_cRSod, _nT],
    [() => CodeReviewSummaryList, 0]
];
var ListDiscoveredEndpointsInput$ = [3, n0, _LDEI,
    0,
    [_pJIe, _aSI, _mR, _pref, _nT],
    [0, 0, 1, 0, 0], 2
];
var ListDiscoveredEndpointsOutput$ = [3, n0, _LDEO,
    0,
    [_dE, _nT],
    [() => DiscoveredEndpointList, 0]
];
var ListFindingsInput$ = [3, n0, _LFI,
    0,
    [_aSI, _mR, _pJIe, _cRJIo, _nT, _rT, _rL, _sta, _conf, _n],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0], 1
];
var ListFindingsOutput$ = [3, n0, _LFO,
    0,
    [_fS, _nT],
    [() => FindingSummaryList, 0]
];
var ListIntegratedResourcesInput$ = [3, n0, _LIRI,
    0,
    [_aSI, _iIn, _rTes, _nT, _mR],
    [0, 0, 0, 0, 1], 1
];
var ListIntegratedResourcesOutput$ = [3, n0, _LIRO,
    0,
    [_iRS, _nT],
    [() => IntegratedResourceSummaryList, 0], 1
];
var ListIntegrationsInput$ = [3, n0, _LII,
    0,
    [_fil, _nT, _mR],
    [() => IntegrationFilter$, 0, 1]
];
var ListIntegrationsOutput$ = [3, n0, _LIO,
    0,
    [_iSn, _nT],
    [() => IntegrationSummaryList, 0], 1
];
var ListMembershipsRequest$ = [3, n0, _LMR,
    0,
    [_aIp, _aSI, _mT, _mR, _nT],
    [0, 0, 0, 1, 0], 2
];
var ListMembershipsResponse$ = [3, n0, _LMRi,
    0,
    [_mS, _nT],
    [() => MembershipSummaryList, 0], 1
];
var ListPentestJobsForPentestInput$ = [3, n0, _LPJFPI,
    0,
    [_pIen, _aSI, _mR, _nT, _jT],
    [0, 0, 1, 0, 0], 2
];
var ListPentestJobsForPentestOutput$ = [3, n0, _LPJFPO,
    0,
    [_pJS, _nT],
    [() => PentestJobSummaryList, 0]
];
var ListPentestJobTasksInput$ = [3, n0, _LPJTI,
    0,
    [_aSI, _mR, _pJIe, _sN, _cNa, _nT],
    [0, 1, 0, 0, 0, 0], 1
];
var ListPentestJobTasksOutput$ = [3, n0, _LPJTO,
    0,
    [_tSa, _nT],
    [() => TaskSummaryList, 0]
];
var ListPentestsInput$ = [3, n0, _LPI,
    0,
    [_aSI, _mR, _nT],
    [0, 1, 0], 1
];
var ListPentestsOutput$ = [3, n0, _LPO,
    0,
    [_pS, _nT],
    [() => PentestSummaryList, 0]
];
var ListPrivateConnectionsInput$ = [3, n0, _LPCI,
    0,
    [_mR, _nT],
    [1, 0]
];
var ListPrivateConnectionsOutput$ = [3, n0, _LPCO,
    0,
    [_pC, _nT],
    [() => PrivateConnectionList, 0], 1
];
var ListSecurityRequirementPackFilter$ = [3, n0, _LSRPF,
    0,
    [_mTa, _sta],
    [0, 0]
];
var ListSecurityRequirementPacksInput$ = [3, n0, _LSRPI,
    0,
    [_fil, _nT, _mR],
    [() => ListSecurityRequirementPackFilter$, 0, 1]
];
var ListSecurityRequirementPacksOutput$ = [3, n0, _LSRPO,
    0,
    [_sRPS, _nT],
    [() => SecurityRequirementPackSummaryList, 0], 1
];
var ListSecurityRequirementsInput$ = [3, n0, _LSRI,
    0,
    [_pI, _nT, _mR],
    [0, 0, 1], 1
];
var ListSecurityRequirementsOutput$ = [3, n0, _LSRO,
    0,
    [_sRS, _nT],
    [() => SecurityRequirementSummaryList, 0], 1
];
var ListTagsForResourceInput$ = [3, n0, _LTFRI,
    0,
    [_rAe],
    [[0, 1]], 1
];
var ListTagsForResourceOutput$ = [3, n0, _LTFRO,
    0,
    [_tag],
    [128 | 0]
];
var ListTargetDomainsInput$ = [3, n0, _LTDI,
    0,
    [_nT, _mR],
    [0, 1]
];
var ListTargetDomainsOutput$ = [3, n0, _LTDO,
    0,
    [_tDS, _nT],
    [() => TargetDomainSummaryList, 0]
];
var ListThreatModelJobsInput$ = [3, n0, _LTMJI,
    0,
    [_tMIh, _aSI, _mR, _nT],
    [0, 0, 1, 0], 2
];
var ListThreatModelJobsOutput$ = [3, n0, _LTMJO,
    0,
    [_tMJS, _nT],
    [() => ThreatModelJobSummaryList, 0]
];
var ListThreatModelJobTasksInput$ = [3, n0, _LTMJTI,
    0,
    [_aSI, _tMJIh, _mR, _nT],
    [0, 0, 1, 0], 2
];
var ListThreatModelJobTasksOutput$ = [3, n0, _LTMJTO,
    0,
    [_tMJTS, _nT],
    [() => ThreatModelJobTaskSummaryList, 0]
];
var ListThreatModelsInput$ = [3, n0, _LTMI,
    0,
    [_aSI, _mR, _nT],
    [0, 1, 0], 1
];
var ListThreatModelsOutput$ = [3, n0, _LTMO,
    0,
    [_tMS, _nT],
    [() => ThreatModelSummaryList, 0]
];
var ListThreatsInput$ = [3, n0, _LTI,
    0,
    [_tJI, _aSI, _nT, _mR],
    [0, 0, 0, 1], 2
];
var ListThreatsOutput$ = [3, n0, _LTO,
    0,
    [_th, _nT],
    [() => ThreatSummaryList, 0]
];
var LogLocation$ = [3, n0, _LL,
    0,
    [_lT, _cWL],
    [0, () => CloudWatchLog$]
];
var MembershipSummary$ = [3, n0, _MS,
    0,
    [_mI, _aIp, _aSI, _mT, _cA, _uA, _cB, _uB, _con, _me],
    [0, 0, 0, 0, 5, 5, 0, 0, () => MembershipConfig$, () => MemberMetadata$], 8
];
var NetworkTrafficConfig$ = [3, n0, _NTC,
    0,
    [_ru, _cH],
    [() => NetworkTrafficRuleList, () => CustomHeaderList]
];
var NetworkTrafficRule$ = [3, n0, _NTR,
    0,
    [_ef, _pa, _nTRT],
    [0, 0, 0]
];
var Pentest$ = [3, n0, _P,
    0,
    [_pIen, _aSI, _ti, _as, _eRT, _sRe, _lCo, _vC, _nTC, _cRSo, _cUS, _dMS, _mTH, _cC, _cA, _uA],
    [0, 0, 0, [() => Assets$, 0], 64 | 0, 0, () => CloudWatchLog$, () => VpcConfig$, () => NetworkTrafficConfig$, 0, 0, 64 | 0, 1, () => CiCdConfiguration$, 5, 5], 4
];
var PentestJob$ = [3, n0, _PJ,
    0,
    [_pJIe, _pIen, _ti, _o, _sta, _en, _ac, _doc, _sCo, _eP, _aD, _eRT, _ste, _eC, _sRe, _lCo, _vC, _nTC, _eI, _iR, _tCC, _cRSo, _cUS, _dMS, _mTH, _jT, _sFI, _sRc, _sCc, _cC, _cA, _uA],
    [0, 0, 0, 0, 0, () => EndpointList, [() => ActorList, 0], () => DocumentList, () => SourceCodeRepositoryList, () => EndpointList, () => EndpointList, 64 | 0, () => StepList, () => ExecutionContextList, 0, () => CloudWatchLog$, () => VpcConfig$, () => NetworkTrafficConfig$, () => ErrorInformation$, () => IntegratedRepositoryList, [() => TrustedCaCertificateList, 0], 0, 0, 64 | 0, 1, 0, 64 | 0, () => ScopeResult$, () => ScopeChangeList, () => CiCdConfiguration$, 5, 5]
];
var PentestJobSummary$ = [3, n0, _PJS,
    0,
    [_pJIe, _pIen, _ti, _sta, _cA, _uA, _jT],
    [0, 0, 0, 0, 5, 5, 0], 2
];
var PentestSummary$ = [3, n0, _PS,
    0,
    [_pIen, _aSI, _ti, _cA, _uA],
    [0, 0, 0, 5, 5], 3
];
var PrivateConnectionSummary$ = [3, n0, _PCS,
    0,
    [_n, _t, _sta, _rGI, _hA, _vI, _rCI, _cET, _dR, _fM, _tag],
    [0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 128 | 0], 3
];
var ReportDestination$ = [3, n0, _RD,
    0,
    [_iIn, _cI, _pIar, _dI],
    [0, 0, 0, 0], 2
];
var ScopeChange$ = [3, n0, _SC,
    0,
    [_iIn, _pRI, _hCS, _bCS, _tRI],
    [0, 0, 0, 0, 0], 3
];
var ScopeResult$ = [3, n0, _SR,
    0,
    [_dec, _rea],
    [0, 0], 2
];
var SecurityRequirementArtifact$ = [3, n0, _SRA,
    0,
    [_n, _fo, _conte],
    [0, 0, [() => SecurityRequirementDocumentContent, 0]], 3
];
var SecurityRequirementPackSummary$ = [3, n0, _SRPS,
    0,
    [_pI, _n, _mTa, _sta, _cA, _uA, _d, _vN],
    [0, 0, 0, 0, 5, 5, 0, 0], 6
];
var SecurityRequirementSummary$ = [3, n0, _SRS,
    0,
    [_pI, _n, _d, _cA, _uA],
    [0, 0, 0, 5, 5], 5
];
var SelfManagedInput$ = [3, n0, _SMI,
    0,
    [_rCI, _ce],
    [0, [() => CertificateChain, 0]], 1
];
var ServiceManagedInput$ = [3, n0, _SMIe,
    0,
    [_hA, _vI, _sI, _sGI, _iAT, _iAPE, _pR, _ce, _dR],
    [0, 0, 64 | 0, 64 | 0, 0, 1, 64 | 0, [() => CertificateChain, 0], 0], 3
];
var SourceCodeRepository$ = [3, n0, _SCR,
    0,
    [_sL],
    [0]
];
var StartCodeRemediationInput$ = [3, n0, _SCRI,
    0,
    [_aSI, _fI, _pJIe, _cRJIo],
    [0, 64 | 0, 0, 0], 2
];
var StartCodeRemediationOutput$ = [3, n0, _SCRO,
    0,
    [],
    []
];
var StartCodeReviewJobInput$ = [3, n0, _SCRJI,
    0,
    [_aSI, _cRIo, _dS],
    [0, 0, () => DiffSource$], 2
];
var StartCodeReviewJobOutput$ = [3, n0, _SCRJO,
    0,
    [_cRIo, _cRJIo, _ti, _sta, _cA, _uA, _aSI],
    [0, 0, 0, 0, 5, 5, 0], 2
];
var StartPentestJobInput$ = [3, n0, _SPJI,
    0,
    [_aSI, _pIen, _jT, _sFI, _sCc],
    [0, 0, 0, 64 | 0, () => ScopeChangeList], 2
];
var StartPentestJobOutput$ = [3, n0, _SPJO,
    0,
    [_ti, _sta, _cA, _uA, _pIen, _pJIe, _aSI],
    [0, 0, 5, 5, 0, 0, 0]
];
var StartThreatModelJobInput$ = [3, n0, _STMJI,
    0,
    [_aSI, _tMIh],
    [0, 0], 2
];
var StartThreatModelJobOutput$ = [3, n0, _STMJO,
    0,
    [_tMJIh, _ti, _sta, _cA, _uA, _tMIh, _aSI],
    [0, 0, 0, 5, 5, 0, 0], 1
];
var Step$ = [3, n0, _S,
    0,
    [_n, _sta, _cA, _uA],
    [0, 0, 5, 5]
];
var StopCodeReviewJobInput$ = [3, n0, _SCRJIt,
    0,
    [_aSI, _cRJIo],
    [0, 0], 2
];
var StopCodeReviewJobOutput$ = [3, n0, _SCRJOt,
    0,
    [],
    []
];
var StopPentestJobInput$ = [3, n0, _SPJIt,
    0,
    [_aSI, _pJIe],
    [0, 0], 2
];
var StopPentestJobOutput$ = [3, n0, _SPJOt,
    0,
    [],
    []
];
var StopThreatModelJobInput$ = [3, n0, _STMJIt,
    0,
    [_aSI, _tMJIh],
    [0, 0], 2
];
var StopThreatModelJobOutput$ = [3, n0, _STMJOt,
    0,
    [],
    []
];
var TagResourceInput$ = [3, n0, _TRI,
    0,
    [_rAe, _tag],
    [[0, 1], 128 | 0], 2
];
var TagResourceOutput$ = [3, n0, _TRO,
    0,
    [],
    []
];
var TargetDomain$ = [3, n0, _TD,
    0,
    [_tDIa, _dN, _vS, _vSR, _vD, _cA, _vA],
    [0, 0, 0, 0, () => VerificationDetails$, 5, 5], 2
];
var TargetDomainSummary$ = [3, n0, _TDS,
    0,
    [_tDIa, _dN, _vS],
    [0, 0, 0], 2
];
var Task$ = [3, n0, _T,
    0,
    [_tIa, _pIen, _pJIe, _aSI, _ti, _d, _ca, _rT, _tE, _eS, _lL, _tH, _cA, _uA],
    [0, 0, 0, 0, 0, 0, () => CategoryList, 0, () => Endpoint$, 0, () => LogLocation$, 1, 5, 5], 1
];
var TaskSummary$ = [3, n0, _TS,
    0,
    [_tIa, _pIen, _pJIe, _aSI, _ti, _rT, _eS, _tH, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, 1, 5, 5], 1
];
var Threat$ = [3, n0, _Th,
    0,
    [_tIhre, _tJI, _ti, _stat, _sev, _sta, _com, _tS, _pre, _tA, _tIhr, _iG, _iA, _an, _evi, _str, _re, _cB, _uB, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64 | 0, 64 | 0, () => ThreatAnchorShape$, () => ThreatEvidenceList, 64 | 0, 0, 0, 0, 5, 5]
];
var ThreatAnchorShape$ = [3, n0, _TAS,
    0,
    [_k, _id, _pIac],
    [0, 0, 0]
];
var ThreatEvidenceShape$ = [3, n0, _TES,
    0,
    [_pIac, _pat],
    [0, 0]
];
var ThreatModel$ = [3, n0, _TM,
    0,
    [_tMIh, _aSI, _ti, _as, _d, _sD, _sRe, _lCo, _cA, _uA],
    [0, 0, 0, [() => Assets$, 0], 0, () => DocumentList, 0, () => CloudWatchLog$, 5, 5], 4
];
var ThreatModelJob$ = [3, n0, _TMJ,
    0,
    [_tMJIh, _tMIh, _aSI, _ti, _sta, _cA, _uA, _eST, _eET, _sCo, _iR, _doc, _sD, _eI, _sO],
    [0, 0, 0, 0, 0, 5, 5, 5, 5, () => SourceCodeRepositoryList, () => IntegratedRepositoryList, () => DocumentList, () => DocumentList, () => ErrorInformation$, 0]
];
var ThreatModelJobSummary$ = [3, n0, _TMJS,
    0,
    [_tMJIh, _tMIh, _aSI, _ti, _sta, _cA, _uA],
    [0, 0, 0, 0, 0, 5, 5], 2
];
var ThreatModelJobTask$ = [3, n0, _TMJT,
    0,
    [_tIa, _tMIh, _tMJIh, _aSI, _ti, _d, _eS, _lL, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, () => LogLocation$, 5, 5], 1
];
var ThreatModelJobTaskSummary$ = [3, n0, _TMJTS,
    0,
    [_tIa, _tMIh, _tMJIh, _aSI, _ti, _eS, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 5, 5], 1
];
var ThreatModelSummary$ = [3, n0, _TMS,
    0,
    [_tMIh, _aSI, _ti, _cA, _uA],
    [0, 0, 0, 5, 5], 3
];
var ThreatSummary$ = [3, n0, _TSh,
    0,
    [_tIhre, _tJI, _ti, _stat, _sev, _sta, _str, _cB, _uB, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 64 | 0, 0, 0, 5, 5]
];
var TrustedCaCertificate$ = [3, n0, _TCC,
    8,
    [_so],
    [[() => CaCertificateSource$, 0]], 1
];
var UntagResourceInput$ = [3, n0, _URI,
    0,
    [_rAe, _tK],
    [[0, 1], [64 | 0, { [_hQ]: _tK }]], 2
];
var UntagResourceOutput$ = [3, n0, _URO,
    0,
    [],
    []
];
var UpdateAgentSpaceInput$ = [3, n0, _UASI,
    0,
    [_aSI, _n, _d, _aR, _tDI, _cRS],
    [0, 0, 0, () => AWSResources$, 64 | 0, () => CodeReviewSettings$], 1
];
var UpdateAgentSpaceOutput$ = [3, n0, _UASO,
    0,
    [_aSI, _n, _d, _aR, _tDI, _cRS, _cA, _uA],
    [0, 0, 0, () => AWSResources$, 64 | 0, () => CodeReviewSettings$, 5, 5], 2
];
var UpdateApplicationRequest$ = [3, n0, _UAR,
    0,
    [_aIp, _rA, _dKKI],
    [0, 0, 0], 1
];
var UpdateApplicationResponse$ = [3, n0, _UARp,
    0,
    [_aIp],
    [0], 1
];
var UpdateCodeReviewInput$ = [3, n0, _UCRI,
    0,
    [_cRIo, _aSI, _ti, _as, _sRe, _lCo, _cRSo, _vM, _mTH],
    [0, 0, 0, [() => Assets$, 0], 0, () => CloudWatchLog$, 0, 0, 1], 2
];
var UpdateCodeReviewOutput$ = [3, n0, _UCRO,
    0,
    [_cRIo, _ti, _cA, _uA, _as, _sRe, _lCo, _aSI, _cRSo, _vM, _mTH],
    [0, 0, 5, 5, [() => Assets$, 0], 0, () => CloudWatchLog$, 0, 0, 0, 1], 1
];
var UpdateFindingInput$ = [3, n0, _UFI,
    0,
    [_fIi, _aSI, _n, _d, _rT, _rL, _rS, _aSt, _reas, _sta, _cN],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 2
];
var UpdateFindingOutput$ = [3, n0, _UFO,
    0,
    [],
    []
];
var UpdateIntegratedResourcesInput$ = [3, n0, _UIRI,
    0,
    [_aSI, _iIn, _it],
    [0, 0, () => IntegratedResourceInputItemList], 3
];
var UpdateIntegratedResourcesOutput$ = [3, n0, _UIRO,
    0,
    [],
    []
];
var UpdatePentestInput$ = [3, n0, _UPI,
    0,
    [_pIen, _aSI, _ti, _as, _eRT, _sRe, _lCo, _vC, _nTC, _cRSo, _dMS, _mTH, _cC],
    [0, 0, 0, [() => Assets$, 0], 64 | 0, 0, () => CloudWatchLog$, () => VpcConfig$, () => NetworkTrafficConfig$, 0, 64 | 0, 1, () => CiCdConfiguration$], 2
];
var UpdatePentestOutput$ = [3, n0, _UPO,
    0,
    [_pIen, _ti, _cA, _uA, _as, _eRT, _sRe, _lCo, _aSI, _cC],
    [0, 0, 5, 5, [() => Assets$, 0], 64 | 0, 0, () => CloudWatchLog$, 0, () => CiCdConfiguration$]
];
var UpdatePrivateConnectionCertificateInput$ = [3, n0, _UPCCI,
    0,
    [_pCN, _ce],
    [0, [() => CertificateChain, 0]], 2
];
var UpdatePrivateConnectionCertificateOutput$ = [3, n0, _UPCCO,
    0,
    [_n, _t, _sta, _rGI, _hA, _vI, _rCI, _cET, _dR, _fM, _tag],
    [0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 128 | 0], 3
];
var UpdateSecurityRequirementEntry$ = [3, n0, _USRE,
    0,
    [_n, _d, _do, _ev, _r],
    [0, 0, 0, 0, 0], 1
];
var UpdateSecurityRequirementPackInput$ = [3, n0, _USRPI,
    0,
    [_pI, _n, _d, _sta],
    [0, 0, 0, 0], 1
];
var UpdateSecurityRequirementPackOutput$ = [3, n0, _USRPO,
    0,
    [_pI, _n, _d, _sta],
    [0, 0, 0, 0], 1
];
var UpdateTargetDomainInput$ = [3, n0, _UTDI,
    0,
    [_tDIa, _vMe],
    [0, 0], 2
];
var UpdateTargetDomainOutput$ = [3, n0, _UTDO,
    0,
    [_tDIa, _dN, _vS, _vSR, _vD, _cA, _vA],
    [0, 0, 0, 0, () => VerificationDetails$, 5, 5], 3
];
var UpdateThreatInput$ = [3, n0, _UTI,
    0,
    [_tIhre, _aSI, _ti, _sta, _com, _stat, _sev, _tS, _pre, _tA, _tIhr, _iG, _iA, _an, _evi, _re],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64 | 0, 64 | 0, () => ThreatAnchorShape$, () => ThreatEvidenceList, 0], 2
];
var UpdateThreatModelInput$ = [3, n0, _UTMI,
    0,
    [_tMIh, _aSI, _ti, _d, _as, _sD, _sRe, _lCo],
    [0, 0, 0, 0, [() => Assets$, 0], () => DocumentList, 0, () => CloudWatchLog$], 2
];
var UpdateThreatModelOutput$ = [3, n0, _UTMO,
    0,
    [_tMIh, _ti, _aSI, _d, _as, _sD, _sRe, _lCo, _cA, _uA],
    [0, 0, 0, 0, [() => Assets$, 0], () => DocumentList, 0, () => CloudWatchLog$, 5, 5], 1
];
var UpdateThreatOutput$ = [3, n0, _UTO,
    0,
    [_tIhre, _tJI, _ti, _stat, _sev, _sta, _com, _str, _tS, _pre, _tA, _tIhr, _iG, _iA, _an, _evi, _re, _cB, _uB, _cA, _uA],
    [0, 0, 0, 0, 0, 0, 0, 64 | 0, 0, 0, 0, 0, 64 | 0, 64 | 0, () => ThreatAnchorShape$, () => ThreatEvidenceList, 0, 0, 0, 5, 5], 2
];
var UserConfig$ = [3, n0, _UC,
    0,
    [_ro],
    [0]
];
var UserMetadata$ = [3, n0, _UM,
    0,
    [_us, _em],
    [0, 0], 2
];
var ValidationExceptionField$ = [3, n0, _VEF,
    0,
    [_pat, _m],
    [0, 0], 2
];
var VerificationDetails$ = [3, n0, _VD,
    0,
    [_met, _dT, _hR],
    [0, () => DnsVerification$, () => HttpVerification$]
];
var VerificationScript$ = [3, n0, _VS,
    0,
    [_sTc, _sUc, _ins, _eV],
    [0, 0, 0, () => VerificationScriptEnvVarList]
];
var VerificationScriptEnvVar$ = [3, n0, _VSEV,
    0,
    [_n, _v],
    [0, 0]
];
var VerifyTargetDomainInput$ = [3, n0, _VTDI,
    0,
    [_tDIa],
    [0], 1
];
var VerifyTargetDomainOutput$ = [3, n0, _VTDO,
    0,
    [_tDIa, _dN, _cA, _uA, _vA, _sta, _vSR],
    [0, 0, 5, 5, 5, 0, 0]
];
var VpcConfig$ = [3, n0, _VC,
    0,
    [_vAp, _sGA, _sAu],
    [0, 64 | 0, 64 | 0]
];
var __Unit = "unit";
var ActorList = [1, n0, _AL,
    0, [() => Actor$,
        0]
];
var AgentSpaceList = [1, n0, _ASL,
    0, () => AgentSpace$
];
var AgentSpaceSummaryList = [1, n0, _ASSL,
    0, () => AgentSpaceSummary$
];
var ApplicationSummaryList = [1, n0, _ASLp,
    0, () => ApplicationSummary$
];
var ArtifactMetadataList = [1, n0, _AML,
    0, () => ArtifactMetadataItem$
];
var ArtifactSummaryList = [1, n0, _ASLr,
    0, () => ArtifactSummary$
];
var BatchCreateSecurityRequirementResultList = [1, n0, _BCSRRL,
    0, () => BatchCreateSecurityRequirementResult$
];
var BatchGetSecurityRequirementResultList = [1, n0, _BGSRRL,
    0, () => BatchGetSecurityRequirementResult$
];
var BatchSecurityRequirementErrors = [1, n0, _BSREa,
    0, () => BatchSecurityRequirementError$
];
var CategoryList = [1, n0, _CLa,
    0, () => Category$
];
var CodeLocationList = [1, n0, _CLL,
    0, () => CodeLocation$
];
var CodeRemediationTaskDetailsList = [1, n0, _CRTDL,
    0, () => CodeRemediationTaskDetails$
];
var CodeReviewJobList = [1, n0, _CRJL,
    0, () => CodeReviewJob$
];
var CodeReviewJobSummaryList = [1, n0, _CRJSL,
    0, () => CodeReviewJobSummary$
];
var CodeReviewJobTaskList = [1, n0, _CRJTL,
    0, () => CodeReviewJobTask$
];
var CodeReviewJobTaskSummaryList = [1, n0, _CRJTSL,
    0, () => CodeReviewJobTaskSummary$
];
var CodeReviewList = [1, n0, _CRL,
    0, [() => CodeReview$,
        0]
];
var CodeReviewSummaryList = [1, n0, _CRSL,
    0, () => CodeReviewSummary$
];
var CreateSecurityRequirementEntryList = [1, n0, _CSREL,
    0, () => CreateSecurityRequirementEntry$
];
var CustomHeaderList = [1, n0, _CHL,
    0, () => CustomHeader$
];
var DeleteCodeReviewFailureList = [1, n0, _DCRFL,
    0, () => DeleteCodeReviewFailure$
];
var DeletePentestFailureList = [1, n0, _DPFL,
    0, () => DeletePentestFailure$
];
var DeleteThreatModelFailureList = [1, n0, _DTMFL,
    0, () => DeleteThreatModelFailure$
];
var DiscoveredEndpointList = [1, n0, _DEL,
    0, () => DiscoveredEndpoint$
];
var DocumentList = [1, n0, _DL,
    0, () => DocumentInfo$
];
var EndpointList = [1, n0, _EL,
    0, () => Endpoint$
];
var ExecutionContextList = [1, n0, _ECL,
    0, () => ExecutionContext$
];
var FindingList = [1, n0, _FL,
    0, () => Finding$
];
var FindingSummaryList = [1, n0, _FSL,
    0, () => FindingSummary$
];
var IntegratedRepositoryList = [1, n0, _IRL,
    0, () => IntegratedRepository$
];
var IntegratedResourceInputItemList = [1, n0, _IRIIL,
    0, () => IntegratedResourceInputItem$
];
var IntegratedResourceSummaryList = [1, n0, _IRSL,
    0, () => IntegratedResourceSummary$
];
var IntegrationSummaryList = [1, n0, _ISL,
    0, () => IntegrationSummary$
];
var MembershipSummaryList = [1, n0, _MSL,
    0, () => MembershipSummary$
];
var NetworkTrafficRuleList = [1, n0, _NTRL,
    0, () => NetworkTrafficRule$
];
var PentestJobList = [1, n0, _PJL,
    0, [() => PentestJob$,
        0]
];
var PentestJobSummaryList = [1, n0, _PJSL,
    0, () => PentestJobSummary$
];
var PentestList = [1, n0, _PL,
    0, [() => Pentest$,
        0]
];
var PentestSummaryList = [1, n0, _PSL,
    0, () => PentestSummary$
];
var PrivateConnectionList = [1, n0, _PCL,
    0, () => PrivateConnectionSummary$
];
var ScopeChangeList = [1, n0, _SCL,
    0, () => ScopeChange$
];
var SecurityRequirementArtifactList = [1, n0, _SRAL,
    0, [() => SecurityRequirementArtifact$,
        0]
];
var SecurityRequirementPackSummaryList = [1, n0, _SRPSL,
    0, () => SecurityRequirementPackSummary$
];
var SecurityRequirementSummaryList = [1, n0, _SRSL,
    0, () => SecurityRequirementSummary$
];
var SourceCodeRepositoryList = [1, n0, _SCRL,
    0, () => SourceCodeRepository$
];
var StepList = [1, n0, _SL,
    0, () => Step$
];
var TargetDomainList = [1, n0, _TDL,
    0, () => TargetDomain$
];
var TargetDomainSummaryList = [1, n0, _TDSL,
    0, () => TargetDomainSummary$
];
var TaskList = [1, n0, _TL,
    0, () => Task$
];
var TaskSummaryList = [1, n0, _TSL,
    0, () => TaskSummary$
];
var ThreatEvidenceList = [1, n0, _TEL,
    0, () => ThreatEvidenceShape$
];
var ThreatList = [1, n0, _TLh,
    0, () => Threat$
];
var ThreatModelJobList = [1, n0, _TMJL,
    0, () => ThreatModelJob$
];
var ThreatModelJobSummaryList = [1, n0, _TMJSL,
    0, () => ThreatModelJobSummary$
];
var ThreatModelJobTaskList = [1, n0, _TMJTL,
    0, () => ThreatModelJobTask$
];
var ThreatModelJobTaskSummaryList = [1, n0, _TMJTSL,
    0, () => ThreatModelJobTaskSummary$
];
var ThreatModelList = [1, n0, _TML,
    0, [() => ThreatModel$,
        0]
];
var ThreatModelSummaryList = [1, n0, _TMSL,
    0, () => ThreatModelSummary$
];
var ThreatSummaryList = [1, n0, _TSLh,
    0, () => ThreatSummary$
];
var TrustedCaCertificateList = [1, n0, _TCCL,
    0, [() => TrustedCaCertificate$,
        0]
];
var UpdateSecurityRequirementEntryList = [1, n0, _USREL,
    0, () => UpdateSecurityRequirementEntry$
];
var ValidationExceptionFieldList = [1, n0, _VEFL,
    0, () => ValidationExceptionField$
];
var VerificationScriptEnvVarList = [1, n0, _VSEVL,
    0, () => VerificationScriptEnvVar$
];
var VpcConfigs = [1, n0, _VCp,
    0, () => VpcConfig$
];
var CaCertificateSource$ = [4, n0, _CCS,
    0,
    [_iPn, _aI, _sL],
    [[() => CaCertificatePem, 0], 0, 0]
];
var DiffSource$ = [4, n0, _DS,
    0,
    [_sUr],
    [0]
];
var ImportSource$ = [4, n0, _ISm,
    0,
    [_doc],
    [[() => SecurityRequirementArtifactList, 0]]
];
var IntegratedResource$ = [4, n0, _IRn,
    0,
    [_gR, _gRi, _bR, _cDo],
    [() => GitHubRepositoryResource$, () => GitLabRepositoryResource$, () => BitbucketRepositoryResource$, () => ConfluenceDocumentResource$]
];
var IntegratedResourceMetadata$ = [4, n0, _IRM,
    0,
    [_gR, _gRi, _bR, _cDo],
    [() => GitHubRepositoryMetadata$, () => GitLabRepositoryMetadata$, () => BitbucketRepositoryMetadata$, () => ConfluenceDocumentMetadata$]
];
var IntegrationFilter$ = [4, n0, _IF,
    0,
    [_pr, _pT],
    [0, 0]
];
var MemberMetadata$ = [4, n0, _MM,
    0,
    [_use],
    [() => UserMetadata$]
];
var MembershipConfig$ = [4, n0, _MC,
    0,
    [_use],
    [() => UserConfig$]
];
var PrivateConnectionMode$ = [4, n0, _PCM,
    0,
    [_sM, _sMe],
    [[() => ServiceManagedInput$, 0], [() => SelfManagedInput$, 0]]
];
var ProviderInput$ = [4, n0, _PI,
    0,
    [_g, _gi, _bi, _confl],
    [() => GitHubIntegrationInput$, [() => GitLabIntegrationInput$, 0], () => BitbucketIntegrationInput$, () => ConfluenceIntegrationInput$]
];
var ProviderResourceCapabilities$ = [4, n0, _PRC,
    0,
    [_g, _gi, _bi, _confl],
    [() => GitHubResourceCapabilities$, () => GitLabResourceCapabilities$, () => BitbucketResourceCapabilities$, () => ConfluenceResourceCapabilities$]
];
var AddArtifact$ = [9, n0, _AA,
    { [_h]: ["POST", "/AddArtifact", 201] }, () => AddArtifactInput$, () => AddArtifactOutput$
];
var BatchCreateSecurityRequirements$ = [9, n0, _BCSR,
    { [_h]: ["POST", "/BatchCreateSecurityRequirements", 201] }, () => BatchCreateSecurityRequirementsInput$, () => BatchCreateSecurityRequirementsOutput$
];
var BatchDeleteCodeReviews$ = [9, n0, _BDCR,
    { [_h]: ["POST", "/BatchDeleteCodeReviews", 200] }, () => BatchDeleteCodeReviewsInput$, () => BatchDeleteCodeReviewsOutput$
];
var BatchDeletePentests$ = [9, n0, _BDP,
    { [_h]: ["POST", "/BatchDeletePentests", 200] }, () => BatchDeletePentestsInput$, () => BatchDeletePentestsOutput$
];
var BatchDeleteSecurityRequirements$ = [9, n0, _BDSR,
    { [_h]: ["POST", "/BatchDeleteSecurityRequirements", 200] }, () => BatchDeleteSecurityRequirementsInput$, () => BatchDeleteSecurityRequirementsOutput$
];
var BatchDeleteThreatModels$ = [9, n0, _BDTM,
    { [_h]: ["POST", "/BatchDeleteThreatModels", 200] }, () => BatchDeleteThreatModelsInput$, () => BatchDeleteThreatModelsOutput$
];
var BatchGetAgentSpaces$ = [9, n0, _BGAS,
    { [_h]: ["POST", "/BatchGetAgentSpaces", 200] }, () => BatchGetAgentSpacesInput$, () => BatchGetAgentSpacesOutput$
];
var BatchGetArtifactMetadata$ = [9, n0, _BGAM,
    { [_h]: ["POST", "/BatchGetArtifactMetadata", 200] }, () => BatchGetArtifactMetadataInput$, () => BatchGetArtifactMetadataOutput$
];
var BatchGetCodeReviewJobs$ = [9, n0, _BGCRJ,
    { [_h]: ["POST", "/BatchGetCodeReviewJobs", 200] }, () => BatchGetCodeReviewJobsInput$, () => BatchGetCodeReviewJobsOutput$
];
var BatchGetCodeReviewJobTasks$ = [9, n0, _BGCRJT,
    { [_h]: ["POST", "/BatchGetCodeReviewJobTasks", 200] }, () => BatchGetCodeReviewJobTasksInput$, () => BatchGetCodeReviewJobTasksOutput$
];
var BatchGetCodeReviews$ = [9, n0, _BGCR,
    { [_h]: ["POST", "/BatchGetCodeReviews", 200] }, () => BatchGetCodeReviewsInput$, () => BatchGetCodeReviewsOutput$
];
var BatchGetFindings$ = [9, n0, _BGF,
    { [_h]: ["POST", "/BatchGetFindings", 200] }, () => BatchGetFindingsInput$, () => BatchGetFindingsOutput$
];
var BatchGetPentestJobs$ = [9, n0, _BGPJ,
    { [_h]: ["POST", "/BatchGetPentestJobs", 200] }, () => BatchGetPentestJobsInput$, () => BatchGetPentestJobsOutput$
];
var BatchGetPentestJobTasks$ = [9, n0, _BGPJT,
    { [_h]: ["POST", "/BatchGetPentestJobTasks", 200] }, () => BatchGetPentestJobTasksInput$, () => BatchGetPentestJobTasksOutput$
];
var BatchGetPentests$ = [9, n0, _BGP,
    { [_h]: ["POST", "/BatchGetPentests", 200] }, () => BatchGetPentestsInput$, () => BatchGetPentestsOutput$
];
var BatchGetSecurityRequirements$ = [9, n0, _BGSR,
    { [_h]: ["POST", "/BatchGetSecurityRequirements", 200] }, () => BatchGetSecurityRequirementsInput$, () => BatchGetSecurityRequirementsOutput$
];
var BatchGetTargetDomains$ = [9, n0, _BGTD,
    { [_h]: ["POST", "/BatchGetTargetDomains", 200] }, () => BatchGetTargetDomainsInput$, () => BatchGetTargetDomainsOutput$
];
var BatchGetThreatModelJobs$ = [9, n0, _BGTMJ,
    { [_h]: ["POST", "/BatchGetThreatModelJobs", 200] }, () => BatchGetThreatModelJobsInput$, () => BatchGetThreatModelJobsOutput$
];
var BatchGetThreatModelJobTasks$ = [9, n0, _BGTMJT,
    { [_h]: ["POST", "/BatchGetThreatModelJobTasks", 200] }, () => BatchGetThreatModelJobTasksInput$, () => BatchGetThreatModelJobTasksOutput$
];
var BatchGetThreatModels$ = [9, n0, _BGTM,
    { [_h]: ["POST", "/BatchGetThreatModels", 200] }, () => BatchGetThreatModelsInput$, () => BatchGetThreatModelsOutput$
];
var BatchGetThreats$ = [9, n0, _BGT,
    { [_h]: ["POST", "/BatchGetThreats", 200] }, () => BatchGetThreatsInput$, () => BatchGetThreatsOutput$
];
var BatchUpdateSecurityRequirements$ = [9, n0, _BUSR,
    { [_h]: ["POST", "/BatchUpdateSecurityRequirements", 200] }, () => BatchUpdateSecurityRequirementsInput$, () => BatchUpdateSecurityRequirementsOutput$
];
var CreateAgentSpace$ = [9, n0, _CAS,
    { [_h]: ["POST", "/CreateAgentSpace", 200] }, () => CreateAgentSpaceInput$, () => CreateAgentSpaceOutput$
];
var CreateApplication$ = [9, n0, _CA,
    { [_h]: ["POST", "/CreateApplication", 200] }, () => CreateApplicationRequest$, () => CreateApplicationResponse$
];
var CreateCodeReview$ = [9, n0, _CCR,
    { [_h]: ["POST", "/CreateCodeReview", 200] }, () => CreateCodeReviewInput$, () => CreateCodeReviewOutput$
];
var CreateIntegration$ = [9, n0, _CI,
    { [_h]: ["POST", "/CreateIntegration", 201] }, () => CreateIntegrationInput$, () => CreateIntegrationOutput$
];
var CreateMembership$ = [9, n0, _CM,
    { [_h]: ["POST", "/CreateMembership", 200] }, () => CreateMembershipRequest$, () => CreateMembershipResponse$
];
var CreatePentest$ = [9, n0, _CP,
    { [_h]: ["POST", "/CreatePentest", 200] }, () => CreatePentestInput$, () => CreatePentestOutput$
];
var CreatePrivateConnection$ = [9, n0, _CPC,
    { [_h]: ["POST", "/CreatePrivateConnection", 201] }, () => CreatePrivateConnectionInput$, () => CreatePrivateConnectionOutput$
];
var CreateSecurityRequirementPack$ = [9, n0, _CSRP,
    { [_h]: ["POST", "/CreateSecurityRequirementPack", 201] }, () => CreateSecurityRequirementPackInput$, () => CreateSecurityRequirementPackOutput$
];
var CreateTargetDomain$ = [9, n0, _CTD,
    { [_h]: ["POST", "/CreateTargetDomain", 200] }, () => CreateTargetDomainInput$, () => CreateTargetDomainOutput$
];
var CreateThreat$ = [9, n0, _CT,
    { [_h]: ["POST", "/CreateThreat", 200] }, () => CreateThreatInput$, () => CreateThreatOutput$
];
var CreateThreatModel$ = [9, n0, _CTM,
    { [_h]: ["POST", "/CreateThreatModel", 200] }, () => CreateThreatModelInput$, () => CreateThreatModelOutput$
];
var DeleteAgentSpace$ = [9, n0, _DAS,
    { [_h]: ["POST", "/DeleteAgentSpace", 200] }, () => DeleteAgentSpaceInput$, () => DeleteAgentSpaceOutput$
];
var DeleteApplication$ = [9, n0, _DA,
    { [_h]: ["POST", "/DeleteApplication", 200] }, () => DeleteApplicationRequest$, () => __Unit
];
var DeleteArtifact$ = [9, n0, _DAe,
    { [_h]: ["POST", "/DeleteArtifact", 200] }, () => DeleteArtifactInput$, () => DeleteArtifactOutput$
];
var DeleteIntegration$ = [9, n0, _DIe,
    { [_h]: ["POST", "/DeleteIntegration", 200] }, () => DeleteIntegrationInput$, () => DeleteIntegrationOutput$
];
var DeleteMembership$ = [9, n0, _DM,
    { [_h]: ["POST", "/DeleteMembership", 200] }, () => DeleteMembershipRequest$, () => DeleteMembershipResponse$
];
var DeletePrivateConnection$ = [9, n0, _DPC,
    { [_h]: ["POST", "/DeletePrivateConnection", 200] }, () => DeletePrivateConnectionInput$, () => DeletePrivateConnectionOutput$
];
var DeleteSecurityRequirementPack$ = [9, n0, _DSRP,
    { [_h]: ["POST", "/DeleteSecurityRequirementPack", 200] }, () => DeleteSecurityRequirementPackInput$, () => DeleteSecurityRequirementPackOutput$
];
var DeleteTargetDomain$ = [9, n0, _DTD,
    { [_h]: ["POST", "/DeleteTargetDomain", 200] }, () => DeleteTargetDomainInput$, () => DeleteTargetDomainOutput$
];
var DescribePrivateConnection$ = [9, n0, _DPCe,
    { [_h]: ["POST", "/DescribePrivateConnection", 200] }, () => DescribePrivateConnectionInput$, () => DescribePrivateConnectionOutput$
];
var GetApplication$ = [9, n0, _GA,
    { [_h]: ["POST", "/GetApplication", 200] }, () => GetApplicationRequest$, () => GetApplicationResponse$
];
var GetArtifact$ = [9, n0, _GAe,
    { [_h]: ["POST", "/GetArtifact", 200] }, () => GetArtifactInput$, () => GetArtifactOutput$
];
var GetIntegration$ = [9, n0, _GI,
    { [_h]: ["POST", "/GetIntegration", 200] }, () => GetIntegrationInput$, () => GetIntegrationOutput$
];
var GetSecurityRequirementPack$ = [9, n0, _GSRP,
    { [_h]: ["POST", "/GetSecurityRequirementPack", 200] }, () => GetSecurityRequirementPackInput$, () => GetSecurityRequirementPackOutput$
];
var ImportSecurityRequirements$ = [9, n0, _ISR,
    { [_h]: ["POST", "/ImportSecurityRequirements", 201] }, () => ImportSecurityRequirementsInput$, () => ImportSecurityRequirementsOutput$
];
var InitiateProviderRegistration$ = [9, n0, _IPR,
    { [_h]: ["POST", "/oauth2/provider/register", 200] }, () => InitiateProviderRegistrationInput$, () => InitiateProviderRegistrationOutput$
];
var ListAgentSpaces$ = [9, n0, _LAS,
    { [_h]: ["POST", "/ListAgentSpaces", 200] }, () => ListAgentSpacesInput$, () => ListAgentSpacesOutput$
];
var ListApplications$ = [9, n0, _LA,
    { [_h]: ["POST", "/ListApplications", 200] }, () => ListApplicationsRequest$, () => ListApplicationsResponse$
];
var ListArtifacts$ = [9, n0, _LAi,
    { [_h]: ["POST", "/ListArtifacts", 200] }, () => ListArtifactsInput$, () => ListArtifactsOutput$
];
var ListCodeReviewJobsForCodeReview$ = [9, n0, _LCRJFCR,
    { [_h]: ["POST", "/ListCodeReviewJobsForCodeReview", 200] }, () => ListCodeReviewJobsForCodeReviewInput$, () => ListCodeReviewJobsForCodeReviewOutput$
];
var ListCodeReviewJobTasks$ = [9, n0, _LCRJT,
    { [_h]: ["POST", "/ListCodeReviewJobTasks", 200] }, () => ListCodeReviewJobTasksInput$, () => ListCodeReviewJobTasksOutput$
];
var ListCodeReviews$ = [9, n0, _LCR,
    { [_h]: ["POST", "/ListCodeReviews", 200] }, () => ListCodeReviewsInput$, () => ListCodeReviewsOutput$
];
var ListDiscoveredEndpoints$ = [9, n0, _LDE,
    { [_h]: ["POST", "/ListDiscoveredEndpoints", 200] }, () => ListDiscoveredEndpointsInput$, () => ListDiscoveredEndpointsOutput$
];
var ListFindings$ = [9, n0, _LF,
    { [_h]: ["POST", "/ListFindings", 200] }, () => ListFindingsInput$, () => ListFindingsOutput$
];
var ListIntegratedResources$ = [9, n0, _LIR,
    { [_h]: ["POST", "/ListIntegratedResources", 200] }, () => ListIntegratedResourcesInput$, () => ListIntegratedResourcesOutput$
];
var ListIntegrations$ = [9, n0, _LI,
    { [_h]: ["POST", "/ListIntegrations", 200] }, () => ListIntegrationsInput$, () => ListIntegrationsOutput$
];
var ListMemberships$ = [9, n0, _LM,
    { [_h]: ["POST", "/ListMemberships", 200] }, () => ListMembershipsRequest$, () => ListMembershipsResponse$
];
var ListPentestJobsForPentest$ = [9, n0, _LPJFP,
    { [_h]: ["POST", "/ListPentestJobsForPentest", 200] }, () => ListPentestJobsForPentestInput$, () => ListPentestJobsForPentestOutput$
];
var ListPentestJobTasks$ = [9, n0, _LPJT,
    { [_h]: ["POST", "/ListPentestJobTasks", 200] }, () => ListPentestJobTasksInput$, () => ListPentestJobTasksOutput$
];
var ListPentests$ = [9, n0, _LP,
    { [_h]: ["POST", "/ListPentests", 200] }, () => ListPentestsInput$, () => ListPentestsOutput$
];
var ListPrivateConnections$ = [9, n0, _LPC,
    { [_h]: ["POST", "/ListPrivateConnections", 200] }, () => ListPrivateConnectionsInput$, () => ListPrivateConnectionsOutput$
];
var ListSecurityRequirementPacks$ = [9, n0, _LSRP,
    { [_h]: ["POST", "/ListSecurityRequirementPacks", 200] }, () => ListSecurityRequirementPacksInput$, () => ListSecurityRequirementPacksOutput$
];
var ListSecurityRequirements$ = [9, n0, _LSR,
    { [_h]: ["POST", "/ListSecurityRequirements", 200] }, () => ListSecurityRequirementsInput$, () => ListSecurityRequirementsOutput$
];
var ListTagsForResource$ = [9, n0, _LTFR,
    { [_h]: ["GET", "/tags/{resourceArn}", 200] }, () => ListTagsForResourceInput$, () => ListTagsForResourceOutput$
];
var ListTargetDomains$ = [9, n0, _LTD,
    { [_h]: ["POST", "/ListTargetDomains", 200] }, () => ListTargetDomainsInput$, () => ListTargetDomainsOutput$
];
var ListThreatModelJobs$ = [9, n0, _LTMJ,
    { [_h]: ["POST", "/ListThreatModelJobs", 200] }, () => ListThreatModelJobsInput$, () => ListThreatModelJobsOutput$
];
var ListThreatModelJobTasks$ = [9, n0, _LTMJT,
    { [_h]: ["POST", "/ListThreatModelJobTasks", 200] }, () => ListThreatModelJobTasksInput$, () => ListThreatModelJobTasksOutput$
];
var ListThreatModels$ = [9, n0, _LTM,
    { [_h]: ["POST", "/ListThreatModels", 200] }, () => ListThreatModelsInput$, () => ListThreatModelsOutput$
];
var ListThreats$ = [9, n0, _LT,
    { [_h]: ["POST", "/ListThreats", 200] }, () => ListThreatsInput$, () => ListThreatsOutput$
];
var StartCodeRemediation$ = [9, n0, _SCRt,
    { [_h]: ["POST", "/StartCodeRemediation", 200] }, () => StartCodeRemediationInput$, () => StartCodeRemediationOutput$
];
var StartCodeReviewJob$ = [9, n0, _SCRJ,
    { [_h]: ["POST", "/StartCodeReviewJob", 200] }, () => StartCodeReviewJobInput$, () => StartCodeReviewJobOutput$
];
var StartPentestJob$ = [9, n0, _SPJ,
    { [_h]: ["POST", "/StartPentestJob", 200] }, () => StartPentestJobInput$, () => StartPentestJobOutput$
];
var StartThreatModelJob$ = [9, n0, _STMJ,
    { [_h]: ["POST", "/StartThreatModelJob", 200] }, () => StartThreatModelJobInput$, () => StartThreatModelJobOutput$
];
var StopCodeReviewJob$ = [9, n0, _SCRJt,
    { [_h]: ["POST", "/StopCodeReviewJob", 200] }, () => StopCodeReviewJobInput$, () => StopCodeReviewJobOutput$
];
var StopPentestJob$ = [9, n0, _SPJt,
    { [_h]: ["POST", "/StopPentestJob", 200] }, () => StopPentestJobInput$, () => StopPentestJobOutput$
];
var StopThreatModelJob$ = [9, n0, _STMJt,
    { [_h]: ["POST", "/StopThreatModelJob", 200] }, () => StopThreatModelJobInput$, () => StopThreatModelJobOutput$
];
var TagResource$ = [9, n0, _TR,
    { [_h]: ["POST", "/tags/{resourceArn}", 204] }, () => TagResourceInput$, () => TagResourceOutput$
];
var UntagResource$ = [9, n0, _UR,
    { [_h]: ["DELETE", "/tags/{resourceArn}", 204] }, () => UntagResourceInput$, () => UntagResourceOutput$
];
var UpdateAgentSpace$ = [9, n0, _UAS,
    { [_h]: ["POST", "/UpdateAgentSpace", 200] }, () => UpdateAgentSpaceInput$, () => UpdateAgentSpaceOutput$
];
var UpdateApplication$ = [9, n0, _UA,
    { [_h]: ["POST", "/UpdateApplication", 200] }, () => UpdateApplicationRequest$, () => UpdateApplicationResponse$
];
var UpdateCodeReview$ = [9, n0, _UCR,
    { [_h]: ["POST", "/UpdateCodeReview", 200] }, () => UpdateCodeReviewInput$, () => UpdateCodeReviewOutput$
];
var UpdateFinding$ = [9, n0, _UF,
    { [_h]: ["POST", "/UpdateFinding", 200] }, () => UpdateFindingInput$, () => UpdateFindingOutput$
];
var UpdateIntegratedResources$ = [9, n0, _UIR,
    { [_h]: ["POST", "/UpdateIntegratedResources", 200] }, () => UpdateIntegratedResourcesInput$, () => UpdateIntegratedResourcesOutput$
];
var UpdatePentest$ = [9, n0, _UP,
    { [_h]: ["POST", "/UpdatePentest", 200] }, () => UpdatePentestInput$, () => UpdatePentestOutput$
];
var UpdatePrivateConnectionCertificate$ = [9, n0, _UPCC,
    { [_h]: ["POST", "/UpdatePrivateConnectionCertificate", 200] }, () => UpdatePrivateConnectionCertificateInput$, () => UpdatePrivateConnectionCertificateOutput$
];
var UpdateSecurityRequirementPack$ = [9, n0, _USRP,
    { [_h]: ["POST", "/UpdateSecurityRequirementPack", 200] }, () => UpdateSecurityRequirementPackInput$, () => UpdateSecurityRequirementPackOutput$
];
var UpdateTargetDomain$ = [9, n0, _UTD,
    { [_h]: ["POST", "/UpdateTargetDomain", 200] }, () => UpdateTargetDomainInput$, () => UpdateTargetDomainOutput$
];
var UpdateThreat$ = [9, n0, _UT,
    { [_h]: ["POST", "/UpdateThreat", 200] }, () => UpdateThreatInput$, () => UpdateThreatOutput$
];
var UpdateThreatModel$ = [9, n0, _UTM,
    { [_h]: ["POST", "/UpdateThreatModel", 200] }, () => UpdateThreatModelInput$, () => UpdateThreatModelOutput$
];
var VerifyTargetDomain$ = [9, n0, _VTD,
    { [_h]: ["POST", "/VerifyTargetDomain", 200] }, () => VerifyTargetDomainInput$, () => VerifyTargetDomainOutput$
];

const getRuntimeConfig$1 = (config) => {
    return {
        apiVersion: "2025-09-06",
        base64Decoder: config?.base64Decoder ?? fromBase64,
        base64Encoder: config?.base64Encoder ?? toBase64,
        disableHostPrefix: config?.disableHostPrefix ?? false,
        endpointProvider: config?.endpointProvider ?? defaultEndpointResolver,
        extensions: config?.extensions ?? [],
        httpAuthSchemeProvider: config?.httpAuthSchemeProvider ?? defaultSecurityAgentHttpAuthSchemeProvider,
        httpAuthSchemes: config?.httpAuthSchemes ?? [
            {
                schemeId: "aws.auth#sigv4",
                identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
                signer: new AwsSdkSigV4Signer(),
            },
        ],
        logger: config?.logger ?? new NoOpLogger(),
        protocol: config?.protocol ?? AwsRestJsonProtocol,
        protocolSettings: config?.protocolSettings ?? {
            defaultNamespace: "com.amazonaws.securityagent",
            errorTypeRegistries,
            version: "2025-09-06",
            serviceTarget: "SecurityAgent",
        },
        serviceId: config?.serviceId ?? "SecurityAgent",
        sha256: config?.sha256 ?? Sha256,
        urlParser: config?.urlParser ?? parseUrl,
        utf8Decoder: config?.utf8Decoder ?? fromUtf8,
        utf8Encoder: config?.utf8Encoder ?? toUtf8,
    };
};

const getRuntimeConfig = (config) => {
    emitWarningIfUnsupportedVersion(process.version);
    const defaultsMode = resolveDefaultsModeConfig(config);
    const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig$1(config);
    emitWarningIfUnsupportedVersion$1(process.version);
    const loaderConfig = {
        profile: config?.profile,
        logger: clientSharedValues.logger,
    };
    return {
        ...clientSharedValues,
        ...config,
        runtime: "node",
        defaultsMode,
        authSchemePreference: config?.authSchemePreference ?? loadConfig(NODE_AUTH_SCHEME_PREFERENCE_OPTIONS, loaderConfig),
        bodyLengthChecker: config?.bodyLengthChecker ?? calculateBodyLength,
        credentialDefaultProvider: config?.credentialDefaultProvider ?? defaultProvider,
        defaultUserAgentProvider: config?.defaultUserAgentProvider ?? createDefaultUserAgentProvider({ serviceId: clientSharedValues.serviceId, clientVersion: packageInfo.version }),
        maxAttempts: config?.maxAttempts ?? loadConfig(NODE_MAX_ATTEMPT_CONFIG_OPTIONS, config),
        region: config?.region ?? loadConfig(NODE_REGION_CONFIG_OPTIONS, { ...NODE_REGION_CONFIG_FILE_OPTIONS, ...loaderConfig }),
        requestHandler: NodeHttpHandler.create(config?.requestHandler ?? defaultConfigProvider),
        retryMode: config?.retryMode ??
            loadConfig({
                ...NODE_RETRY_MODE_CONFIG_OPTIONS,
                default: async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE,
            }, config),
        streamCollector: config?.streamCollector ?? streamCollector,
        useDualstackEndpoint: config?.useDualstackEndpoint ?? loadConfig(NODE_USE_DUALSTACK_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        useFipsEndpoint: config?.useFipsEndpoint ?? loadConfig(NODE_USE_FIPS_ENDPOINT_CONFIG_OPTIONS, loaderConfig),
        userAgentAppId: config?.userAgentAppId ?? loadConfig(NODE_APP_ID_CONFIG_OPTIONS, loaderConfig),
    };
};

const getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
        setHttpAuthScheme(httpAuthScheme) {
            const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
            if (index === -1) {
                _httpAuthSchemes.push(httpAuthScheme);
            }
            else {
                _httpAuthSchemes.splice(index, 1, httpAuthScheme);
            }
        },
        httpAuthSchemes() {
            return _httpAuthSchemes;
        },
        setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
            _httpAuthSchemeProvider = httpAuthSchemeProvider;
        },
        httpAuthSchemeProvider() {
            return _httpAuthSchemeProvider;
        },
        setCredentials(credentials) {
            _credentials = credentials;
        },
        credentials() {
            return _credentials;
        },
    };
};
const resolveHttpAuthRuntimeConfig = (config) => {
    return {
        httpAuthSchemes: config.httpAuthSchemes(),
        httpAuthSchemeProvider: config.httpAuthSchemeProvider(),
        credentials: config.credentials(),
    };
};

const resolveRuntimeExtensions = (runtimeConfig, extensions) => {
    const extensionConfiguration = Object.assign(getAwsRegionExtensionConfiguration(runtimeConfig), getDefaultExtensionConfiguration(runtimeConfig), getHttpHandlerExtensionConfiguration(runtimeConfig), getHttpAuthExtensionConfiguration(runtimeConfig));
    extensions.forEach((extension) => extension.configure(extensionConfiguration));
    return Object.assign(runtimeConfig, resolveAwsRegionExtensionConfiguration(extensionConfiguration), resolveDefaultRuntimeConfig(extensionConfiguration), resolveHttpHandlerRuntimeConfig(extensionConfiguration), resolveHttpAuthRuntimeConfig(extensionConfiguration));
};

class SecurityAgentClient extends Client {
    config;
    constructor(...[configuration]) {
        const _config_0 = getRuntimeConfig(configuration || {});
        super(_config_0);
        this.initConfig = _config_0;
        const _config_1 = resolveClientEndpointParameters(_config_0);
        const _config_2 = resolveUserAgentConfig(_config_1);
        const _config_3 = resolveRetryConfig(_config_2);
        const _config_4 = resolveRegionConfig(_config_3);
        const _config_5 = resolveHostHeaderConfig(_config_4);
        const _config_6 = resolveEndpointConfig(_config_5);
        const _config_7 = resolveHttpAuthSchemeConfig(_config_6);
        const _config_8 = resolveRuntimeExtensions(_config_7, configuration?.extensions || []);
        this.config = _config_8;
        this.middlewareStack.use(getSchemaSerdePlugin(this.config));
        this.middlewareStack.use(getUserAgentPlugin(this.config));
        this.middlewareStack.use(getRetryPlugin(this.config));
        this.middlewareStack.use(getContentLengthPlugin(this.config));
        this.middlewareStack.use(getHostHeaderPlugin(this.config));
        this.middlewareStack.use(getLoggerPlugin(this.config));
        this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
        this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
            httpAuthSchemeParametersProvider: defaultSecurityAgentHttpAuthSchemeParametersProvider,
            identityProviderConfigProvider: async (config) => new DefaultIdentityProviderConfig({
                "aws.auth#sigv4": config.credentials,
            }),
        }));
        this.middlewareStack.use(getHttpSigningPlugin(this.config));
    }
    destroy() {
        super.destroy();
    }
}

const command = makeBuilder(commonParams, "SecurityAgent", "SecurityAgentClient", getEndpointPlugin);
const _ep0 = {};
const _mw0 = (Command, cs, config, o) => [];

class AddArtifactCommand extends command(_ep0, _mw0, "AddArtifact", AddArtifact$) {
}

class BatchCreateSecurityRequirementsCommand extends command(_ep0, _mw0, "BatchCreateSecurityRequirements", BatchCreateSecurityRequirements$) {
}

class BatchDeleteCodeReviewsCommand extends command(_ep0, _mw0, "BatchDeleteCodeReviews", BatchDeleteCodeReviews$) {
}

class BatchDeletePentestsCommand extends command(_ep0, _mw0, "BatchDeletePentests", BatchDeletePentests$) {
}

class BatchDeleteSecurityRequirementsCommand extends command(_ep0, _mw0, "BatchDeleteSecurityRequirements", BatchDeleteSecurityRequirements$) {
}

class BatchDeleteThreatModelsCommand extends command(_ep0, _mw0, "BatchDeleteThreatModels", BatchDeleteThreatModels$) {
}

class BatchGetAgentSpacesCommand extends command(_ep0, _mw0, "BatchGetAgentSpaces", BatchGetAgentSpaces$) {
}

class BatchGetArtifactMetadataCommand extends command(_ep0, _mw0, "BatchGetArtifactMetadata", BatchGetArtifactMetadata$) {
}

class BatchGetCodeReviewJobsCommand extends command(_ep0, _mw0, "BatchGetCodeReviewJobs", BatchGetCodeReviewJobs$) {
}

class BatchGetCodeReviewJobTasksCommand extends command(_ep0, _mw0, "BatchGetCodeReviewJobTasks", BatchGetCodeReviewJobTasks$) {
}

class BatchGetCodeReviewsCommand extends command(_ep0, _mw0, "BatchGetCodeReviews", BatchGetCodeReviews$) {
}

class BatchGetFindingsCommand extends command(_ep0, _mw0, "BatchGetFindings", BatchGetFindings$) {
}

class BatchGetPentestJobsCommand extends command(_ep0, _mw0, "BatchGetPentestJobs", BatchGetPentestJobs$) {
}

class BatchGetPentestJobTasksCommand extends command(_ep0, _mw0, "BatchGetPentestJobTasks", BatchGetPentestJobTasks$) {
}

class BatchGetPentestsCommand extends command(_ep0, _mw0, "BatchGetPentests", BatchGetPentests$) {
}

class BatchGetSecurityRequirementsCommand extends command(_ep0, _mw0, "BatchGetSecurityRequirements", BatchGetSecurityRequirements$) {
}

class BatchGetTargetDomainsCommand extends command(_ep0, _mw0, "BatchGetTargetDomains", BatchGetTargetDomains$) {
}

class BatchGetThreatModelJobsCommand extends command(_ep0, _mw0, "BatchGetThreatModelJobs", BatchGetThreatModelJobs$) {
}

class BatchGetThreatModelJobTasksCommand extends command(_ep0, _mw0, "BatchGetThreatModelJobTasks", BatchGetThreatModelJobTasks$) {
}

class BatchGetThreatModelsCommand extends command(_ep0, _mw0, "BatchGetThreatModels", BatchGetThreatModels$) {
}

class BatchGetThreatsCommand extends command(_ep0, _mw0, "BatchGetThreats", BatchGetThreats$) {
}

class BatchUpdateSecurityRequirementsCommand extends command(_ep0, _mw0, "BatchUpdateSecurityRequirements", BatchUpdateSecurityRequirements$) {
}

class CreateAgentSpaceCommand extends command(_ep0, _mw0, "CreateAgentSpace", CreateAgentSpace$) {
}

class CreateApplicationCommand extends command(_ep0, _mw0, "CreateApplication", CreateApplication$) {
}

class CreateCodeReviewCommand extends command(_ep0, _mw0, "CreateCodeReview", CreateCodeReview$) {
}

class CreateIntegrationCommand extends command(_ep0, _mw0, "CreateIntegration", CreateIntegration$) {
}

class CreateMembershipCommand extends command(_ep0, _mw0, "CreateMembership", CreateMembership$) {
}

class CreatePentestCommand extends command(_ep0, _mw0, "CreatePentest", CreatePentest$) {
}

class CreatePrivateConnectionCommand extends command(_ep0, _mw0, "CreatePrivateConnection", CreatePrivateConnection$) {
}

class CreateSecurityRequirementPackCommand extends command(_ep0, _mw0, "CreateSecurityRequirementPack", CreateSecurityRequirementPack$) {
}

class CreateTargetDomainCommand extends command(_ep0, _mw0, "CreateTargetDomain", CreateTargetDomain$) {
}

class CreateThreatCommand extends command(_ep0, _mw0, "CreateThreat", CreateThreat$) {
}

class CreateThreatModelCommand extends command(_ep0, _mw0, "CreateThreatModel", CreateThreatModel$) {
}

class DeleteAgentSpaceCommand extends command(_ep0, _mw0, "DeleteAgentSpace", DeleteAgentSpace$) {
}

class DeleteApplicationCommand extends command(_ep0, _mw0, "DeleteApplication", DeleteApplication$) {
}

class DeleteArtifactCommand extends command(_ep0, _mw0, "DeleteArtifact", DeleteArtifact$) {
}

class DeleteIntegrationCommand extends command(_ep0, _mw0, "DeleteIntegration", DeleteIntegration$) {
}

class DeleteMembershipCommand extends command(_ep0, _mw0, "DeleteMembership", DeleteMembership$) {
}

class DeletePrivateConnectionCommand extends command(_ep0, _mw0, "DeletePrivateConnection", DeletePrivateConnection$) {
}

class DeleteSecurityRequirementPackCommand extends command(_ep0, _mw0, "DeleteSecurityRequirementPack", DeleteSecurityRequirementPack$) {
}

class DeleteTargetDomainCommand extends command(_ep0, _mw0, "DeleteTargetDomain", DeleteTargetDomain$) {
}

class DescribePrivateConnectionCommand extends command(_ep0, _mw0, "DescribePrivateConnection", DescribePrivateConnection$) {
}

class GetApplicationCommand extends command(_ep0, _mw0, "GetApplication", GetApplication$) {
}

class GetArtifactCommand extends command(_ep0, _mw0, "GetArtifact", GetArtifact$) {
}

class GetIntegrationCommand extends command(_ep0, _mw0, "GetIntegration", GetIntegration$) {
}

class GetSecurityRequirementPackCommand extends command(_ep0, _mw0, "GetSecurityRequirementPack", GetSecurityRequirementPack$) {
}

class ImportSecurityRequirementsCommand extends command(_ep0, _mw0, "ImportSecurityRequirements", ImportSecurityRequirements$) {
}

class InitiateProviderRegistrationCommand extends command(_ep0, _mw0, "InitiateProviderRegistration", InitiateProviderRegistration$) {
}

class ListAgentSpacesCommand extends command(_ep0, _mw0, "ListAgentSpaces", ListAgentSpaces$) {
}

class ListApplicationsCommand extends command(_ep0, _mw0, "ListApplications", ListApplications$) {
}

class ListArtifactsCommand extends command(_ep0, _mw0, "ListArtifacts", ListArtifacts$) {
}

class ListCodeReviewJobsForCodeReviewCommand extends command(_ep0, _mw0, "ListCodeReviewJobsForCodeReview", ListCodeReviewJobsForCodeReview$) {
}

class ListCodeReviewJobTasksCommand extends command(_ep0, _mw0, "ListCodeReviewJobTasks", ListCodeReviewJobTasks$) {
}

class ListCodeReviewsCommand extends command(_ep0, _mw0, "ListCodeReviews", ListCodeReviews$) {
}

class ListDiscoveredEndpointsCommand extends command(_ep0, _mw0, "ListDiscoveredEndpoints", ListDiscoveredEndpoints$) {
}

class ListFindingsCommand extends command(_ep0, _mw0, "ListFindings", ListFindings$) {
}

class ListIntegratedResourcesCommand extends command(_ep0, _mw0, "ListIntegratedResources", ListIntegratedResources$) {
}

class ListIntegrationsCommand extends command(_ep0, _mw0, "ListIntegrations", ListIntegrations$) {
}

class ListMembershipsCommand extends command(_ep0, _mw0, "ListMemberships", ListMemberships$) {
}

class ListPentestJobsForPentestCommand extends command(_ep0, _mw0, "ListPentestJobsForPentest", ListPentestJobsForPentest$) {
}

class ListPentestJobTasksCommand extends command(_ep0, _mw0, "ListPentestJobTasks", ListPentestJobTasks$) {
}

class ListPentestsCommand extends command(_ep0, _mw0, "ListPentests", ListPentests$) {
}

class ListPrivateConnectionsCommand extends command(_ep0, _mw0, "ListPrivateConnections", ListPrivateConnections$) {
}

class ListSecurityRequirementPacksCommand extends command(_ep0, _mw0, "ListSecurityRequirementPacks", ListSecurityRequirementPacks$) {
}

class ListSecurityRequirementsCommand extends command(_ep0, _mw0, "ListSecurityRequirements", ListSecurityRequirements$) {
}

class ListTagsForResourceCommand extends command(_ep0, _mw0, "ListTagsForResource", ListTagsForResource$) {
}

class ListTargetDomainsCommand extends command(_ep0, _mw0, "ListTargetDomains", ListTargetDomains$) {
}

class ListThreatModelJobsCommand extends command(_ep0, _mw0, "ListThreatModelJobs", ListThreatModelJobs$) {
}

class ListThreatModelJobTasksCommand extends command(_ep0, _mw0, "ListThreatModelJobTasks", ListThreatModelJobTasks$) {
}

class ListThreatModelsCommand extends command(_ep0, _mw0, "ListThreatModels", ListThreatModels$) {
}

class ListThreatsCommand extends command(_ep0, _mw0, "ListThreats", ListThreats$) {
}

class StartCodeRemediationCommand extends command(_ep0, _mw0, "StartCodeRemediation", StartCodeRemediation$) {
}

class StartCodeReviewJobCommand extends command(_ep0, _mw0, "StartCodeReviewJob", StartCodeReviewJob$) {
}

class StartPentestJobCommand extends command(_ep0, _mw0, "StartPentestJob", StartPentestJob$) {
}

class StartThreatModelJobCommand extends command(_ep0, _mw0, "StartThreatModelJob", StartThreatModelJob$) {
}

class StopCodeReviewJobCommand extends command(_ep0, _mw0, "StopCodeReviewJob", StopCodeReviewJob$) {
}

class StopPentestJobCommand extends command(_ep0, _mw0, "StopPentestJob", StopPentestJob$) {
}

class StopThreatModelJobCommand extends command(_ep0, _mw0, "StopThreatModelJob", StopThreatModelJob$) {
}

class TagResourceCommand extends command(_ep0, _mw0, "TagResource", TagResource$) {
}

class UntagResourceCommand extends command(_ep0, _mw0, "UntagResource", UntagResource$) {
}

class UpdateAgentSpaceCommand extends command(_ep0, _mw0, "UpdateAgentSpace", UpdateAgentSpace$) {
}

class UpdateApplicationCommand extends command(_ep0, _mw0, "UpdateApplication", UpdateApplication$) {
}

class UpdateCodeReviewCommand extends command(_ep0, _mw0, "UpdateCodeReview", UpdateCodeReview$) {
}

class UpdateFindingCommand extends command(_ep0, _mw0, "UpdateFinding", UpdateFinding$) {
}

class UpdateIntegratedResourcesCommand extends command(_ep0, _mw0, "UpdateIntegratedResources", UpdateIntegratedResources$) {
}

class UpdatePentestCommand extends command(_ep0, _mw0, "UpdatePentest", UpdatePentest$) {
}

class UpdatePrivateConnectionCertificateCommand extends command(_ep0, _mw0, "UpdatePrivateConnectionCertificate", UpdatePrivateConnectionCertificate$) {
}

class UpdateSecurityRequirementPackCommand extends command(_ep0, _mw0, "UpdateSecurityRequirementPack", UpdateSecurityRequirementPack$) {
}

class UpdateTargetDomainCommand extends command(_ep0, _mw0, "UpdateTargetDomain", UpdateTargetDomain$) {
}

class UpdateThreatCommand extends command(_ep0, _mw0, "UpdateThreat", UpdateThreat$) {
}

class UpdateThreatModelCommand extends command(_ep0, _mw0, "UpdateThreatModel", UpdateThreatModel$) {
}

class VerifyTargetDomainCommand extends command(_ep0, _mw0, "VerifyTargetDomain", VerifyTargetDomain$) {
}

const paginateListAgentSpaces = createPaginator(SecurityAgentClient, ListAgentSpacesCommand, "nextToken", "nextToken", "maxResults");

const paginateListApplications = createPaginator(SecurityAgentClient, ListApplicationsCommand, "nextToken", "nextToken", "maxResults");

const paginateListArtifacts = createPaginator(SecurityAgentClient, ListArtifactsCommand, "nextToken", "nextToken", "maxResults");

const paginateListCodeReviewJobsForCodeReview = createPaginator(SecurityAgentClient, ListCodeReviewJobsForCodeReviewCommand, "nextToken", "nextToken", "maxResults");

const paginateListCodeReviewJobTasks = createPaginator(SecurityAgentClient, ListCodeReviewJobTasksCommand, "nextToken", "nextToken", "maxResults");

const paginateListCodeReviews = createPaginator(SecurityAgentClient, ListCodeReviewsCommand, "nextToken", "nextToken", "maxResults");

const paginateListDiscoveredEndpoints = createPaginator(SecurityAgentClient, ListDiscoveredEndpointsCommand, "nextToken", "nextToken", "maxResults");

const paginateListFindings = createPaginator(SecurityAgentClient, ListFindingsCommand, "nextToken", "nextToken", "maxResults");

const paginateListIntegratedResources = createPaginator(SecurityAgentClient, ListIntegratedResourcesCommand, "nextToken", "nextToken", "maxResults");

const paginateListIntegrations = createPaginator(SecurityAgentClient, ListIntegrationsCommand, "nextToken", "nextToken", "maxResults");

const paginateListMemberships = createPaginator(SecurityAgentClient, ListMembershipsCommand, "nextToken", "nextToken", "maxResults");

const paginateListPentestJobsForPentest = createPaginator(SecurityAgentClient, ListPentestJobsForPentestCommand, "nextToken", "nextToken", "maxResults");

const paginateListPentestJobTasks = createPaginator(SecurityAgentClient, ListPentestJobTasksCommand, "nextToken", "nextToken", "maxResults");

const paginateListPentests = createPaginator(SecurityAgentClient, ListPentestsCommand, "nextToken", "nextToken", "maxResults");

const paginateListPrivateConnections = createPaginator(SecurityAgentClient, ListPrivateConnectionsCommand, "nextToken", "nextToken", "maxResults");

const paginateListSecurityRequirementPacks = createPaginator(SecurityAgentClient, ListSecurityRequirementPacksCommand, "nextToken", "nextToken", "maxResults");

const paginateListSecurityRequirements = createPaginator(SecurityAgentClient, ListSecurityRequirementsCommand, "nextToken", "nextToken", "maxResults");

const paginateListTargetDomains = createPaginator(SecurityAgentClient, ListTargetDomainsCommand, "nextToken", "nextToken", "maxResults");

const paginateListThreatModelJobs = createPaginator(SecurityAgentClient, ListThreatModelJobsCommand, "nextToken", "nextToken", "maxResults");

const paginateListThreatModelJobTasks = createPaginator(SecurityAgentClient, ListThreatModelJobTasksCommand, "nextToken", "nextToken", "maxResults");

const paginateListThreatModels = createPaginator(SecurityAgentClient, ListThreatModelsCommand, "nextToken", "nextToken", "maxResults");

const paginateListThreats = createPaginator(SecurityAgentClient, ListThreatsCommand, "nextToken", "nextToken", "maxResults");

const commands = {
    AddArtifactCommand,
    BatchCreateSecurityRequirementsCommand,
    BatchDeleteCodeReviewsCommand,
    BatchDeletePentestsCommand,
    BatchDeleteSecurityRequirementsCommand,
    BatchDeleteThreatModelsCommand,
    BatchGetAgentSpacesCommand,
    BatchGetArtifactMetadataCommand,
    BatchGetCodeReviewJobsCommand,
    BatchGetCodeReviewJobTasksCommand,
    BatchGetCodeReviewsCommand,
    BatchGetFindingsCommand,
    BatchGetPentestJobsCommand,
    BatchGetPentestJobTasksCommand,
    BatchGetPentestsCommand,
    BatchGetSecurityRequirementsCommand,
    BatchGetTargetDomainsCommand,
    BatchGetThreatModelJobsCommand,
    BatchGetThreatModelJobTasksCommand,
    BatchGetThreatModelsCommand,
    BatchGetThreatsCommand,
    BatchUpdateSecurityRequirementsCommand,
    CreateAgentSpaceCommand,
    CreateApplicationCommand,
    CreateCodeReviewCommand,
    CreateIntegrationCommand,
    CreateMembershipCommand,
    CreatePentestCommand,
    CreatePrivateConnectionCommand,
    CreateSecurityRequirementPackCommand,
    CreateTargetDomainCommand,
    CreateThreatCommand,
    CreateThreatModelCommand,
    DeleteAgentSpaceCommand,
    DeleteApplicationCommand,
    DeleteArtifactCommand,
    DeleteIntegrationCommand,
    DeleteMembershipCommand,
    DeletePrivateConnectionCommand,
    DeleteSecurityRequirementPackCommand,
    DeleteTargetDomainCommand,
    DescribePrivateConnectionCommand,
    GetApplicationCommand,
    GetArtifactCommand,
    GetIntegrationCommand,
    GetSecurityRequirementPackCommand,
    ImportSecurityRequirementsCommand,
    InitiateProviderRegistrationCommand,
    ListAgentSpacesCommand,
    ListApplicationsCommand,
    ListArtifactsCommand,
    ListCodeReviewJobsForCodeReviewCommand,
    ListCodeReviewJobTasksCommand,
    ListCodeReviewsCommand,
    ListDiscoveredEndpointsCommand,
    ListFindingsCommand,
    ListIntegratedResourcesCommand,
    ListIntegrationsCommand,
    ListMembershipsCommand,
    ListPentestJobsForPentestCommand,
    ListPentestJobTasksCommand,
    ListPentestsCommand,
    ListPrivateConnectionsCommand,
    ListSecurityRequirementPacksCommand,
    ListSecurityRequirementsCommand,
    ListTagsForResourceCommand,
    ListTargetDomainsCommand,
    ListThreatModelJobsCommand,
    ListThreatModelJobTasksCommand,
    ListThreatModelsCommand,
    ListThreatsCommand,
    StartCodeRemediationCommand,
    StartCodeReviewJobCommand,
    StartPentestJobCommand,
    StartThreatModelJobCommand,
    StopCodeReviewJobCommand,
    StopPentestJobCommand,
    StopThreatModelJobCommand,
    TagResourceCommand,
    UntagResourceCommand,
    UpdateAgentSpaceCommand,
    UpdateApplicationCommand,
    UpdateCodeReviewCommand,
    UpdateFindingCommand,
    UpdateIntegratedResourcesCommand,
    UpdatePentestCommand,
    UpdatePrivateConnectionCertificateCommand,
    UpdateSecurityRequirementPackCommand,
    UpdateTargetDomainCommand,
    UpdateThreatCommand,
    UpdateThreatModelCommand,
    VerifyTargetDomainCommand,
};
const paginators = {
    paginateListAgentSpaces,
    paginateListApplications,
    paginateListArtifacts,
    paginateListCodeReviewJobsForCodeReview,
    paginateListCodeReviewJobTasks,
    paginateListCodeReviews,
    paginateListDiscoveredEndpoints,
    paginateListFindings,
    paginateListIntegratedResources,
    paginateListIntegrations,
    paginateListMemberships,
    paginateListPentestJobsForPentest,
    paginateListPentestJobTasks,
    paginateListPentests,
    paginateListPrivateConnections,
    paginateListSecurityRequirementPacks,
    paginateListSecurityRequirements,
    paginateListTargetDomains,
    paginateListThreatModelJobs,
    paginateListThreatModelJobTasks,
    paginateListThreatModels,
    paginateListThreats,
};
class SecurityAgent extends SecurityAgentClient {
}
createAggregatedClient(commands, SecurityAgent, { paginators });

const AccessType = {
    PRIVATE: "PRIVATE",
    PUBLIC: "PUBLIC",
};
const AuthenticationProviderType = {
    AWS_IAM_ROLE: "AWS_IAM_ROLE",
    AWS_INTERNAL: "AWS_INTERNAL",
    AWS_LAMBDA: "AWS_LAMBDA",
    SECRETS_MANAGER: "SECRETS_MANAGER",
};
const ArtifactType = {
    DOC: "DOC",
    DOCX: "DOCX",
    JPEG: "JPEG",
    JSON: "JSON",
    MD: "MD",
    PDF: "PDF",
    PNG: "PNG",
    TXT: "TXT",
    YAML: "YAML",
};
const CleanUpStrategy = {
    BEST_EFFORT_DELETE: "BEST_EFFORT_DELETE",
    RETAIN_ALL: "RETAIN_ALL",
};
const CodeRemediationStrategy = {
    AUTOMATIC: "AUTOMATIC",
    DISABLED: "DISABLED",
};
const SkillType = {
    FINDING_PERSONALIZATION: "FINDING_PERSONALIZATION",
    LOGIN_OPTIMIZATION: "LOGIN_OPTIMIZATION",
};
const RiskType = {
    ARBITRARY_FILE_UPLOAD: "ARBITRARY_FILE_UPLOAD",
    BUSINESS_LOGIC_VULNERABILITIES: "BUSINESS_LOGIC_VULNERABILITIES",
    CODE_INJECTION: "CODE_INJECTION",
    COMMAND_INJECTION: "COMMAND_INJECTION",
    CROSS_SITE_SCRIPTING: "CROSS_SITE_SCRIPTING",
    CRYPTOGRAPHIC_VULNERABILITIES: "CRYPTOGRAPHIC_VULNERABILITIES",
    DATABASE_ACCESS: "DATABASE_ACCESS",
    DATABASE_MODIFICATION: "DATABASE_MODIFICATION",
    DEFAULT_CREDENTIALS: "DEFAULT_CREDENTIALS",
    DENIAL_OF_SERVICE: "DENIAL_OF_SERVICE",
    FILE_ACCESS: "FILE_ACCESS",
    FILE_CREATION: "FILE_CREATION",
    FILE_DELETION: "FILE_DELETION",
    GRAPHQL_VULNERABILITIES: "GRAPHQL_VULNERABILITIES",
    INFORMATION_DISCLOSURE: "INFORMATION_DISCLOSURE",
    INSECURE_DESERIALIZATION: "INSECURE_DESERIALIZATION",
    INSECURE_DIRECT_OBJECT_REFERENCE: "INSECURE_DIRECT_OBJECT_REFERENCE",
    JSON_WEB_TOKEN_VULNERABILITIES: "JSON_WEB_TOKEN_VULNERABILITIES",
    LOCAL_FILE_INCLUSION: "LOCAL_FILE_INCLUSION",
    OTHER: "OTHER",
    OUTBOUND_SERVICE_REQUEST: "OUTBOUND_SERVICE_REQUEST",
    PATH_TRAVERSAL: "PATH_TRAVERSAL",
    PRIVILEGE_ESCALATION: "PRIVILEGE_ESCALATION",
    SERVER_SIDE_REQUEST_FORGERY: "SERVER_SIDE_REQUEST_FORGERY",
    SERVER_SIDE_TEMPLATE_INJECTION: "SERVER_SIDE_TEMPLATE_INJECTION",
    SQL_INJECTION: "SQL_INJECTION",
    UNKNOWN: "UNKNOWN",
    XML_EXTERNAL_ENTITY: "XML_EXTERNAL_ENTITY",
};
const NetworkTrafficRuleEffect = {
    ALLOW: "ALLOW",
    DENY: "DENY",
};
const NetworkTrafficRuleType = {
    URL: "URL",
};
const ErrorCode = {
    CLIENT_ERROR: "CLIENT_ERROR",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    STOPPED_BY_USER: "STOPPED_BY_USER",
};
const ContextType = {
    CLIENT_ERROR: "CLIENT_ERROR",
    ERROR: "ERROR",
    INFO: "INFO",
    WARNING: "WARNING",
};
const JobStatus = {
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    IN_PROGRESS: "IN_PROGRESS",
    STOPPED: "STOPPED",
    STOPPING: "STOPPING",
};
const StepName = {
    FINALIZING: "FINALIZING",
    PENTEST: "PENTEST",
    PREFLIGHT: "PREFLIGHT",
    STATIC_ANALYSIS: "STATIC_ANALYSIS",
    VALIDATION: "VALIDATION",
};
const StepStatus = {
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    IN_PROGRESS: "IN_PROGRESS",
    NOT_STARTED: "NOT_STARTED",
    STOPPED: "STOPPED",
};
const TaskExecutionStatus = {
    ABORTED: "ABORTED",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    IN_PROGRESS: "IN_PROGRESS",
};
const LogType = {
    CLOUDWATCH: "CLOUDWATCH",
};
const ValidationMode = {
    DISABLED: "DISABLED",
    SIMULATED: "SIMULATED",
};
const CodeRemediationTaskStatus = {
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    IN_PROGRESS: "IN_PROGRESS",
};
const ConfidenceLevel = {
    FALSE_POSITIVE: "FALSE_POSITIVE",
    HIGH: "HIGH",
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    UNCONFIRMED: "UNCONFIRMED",
};
const RiskLevel = {
    CRITICAL: "CRITICAL",
    HIGH: "HIGH",
    INFORMATIONAL: "INFORMATIONAL",
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    UNKNOWN: "UNKNOWN",
};
const FindingStatus = {
    ACCEPTED: "ACCEPTED",
    ACTIVE: "ACTIVE",
    FALSE_POSITIVE: "FALSE_POSITIVE",
    RESOLVED: "RESOLVED",
};
const ValidationStatus = {
    CONFIRMED: "CONFIRMED",
    NOT_REPRODUCED: "NOT_REPRODUCED",
    NOT_VALIDATED: "NOT_VALIDATED",
    VALIDATING: "VALIDATING",
    VALIDATION_FAILED: "VALIDATION_FAILED",
};
const JobType = {
    CICD: "CICD",
    FULL: "FULL",
    REVALIDATION: "REVALIDATION",
};
const ScopeDecision = {
    IN_SCOPE: "IN_SCOPE",
    SCOPED_OUT: "SCOPED_OUT",
    SCOPE_CONFLICT: "SCOPE_CONFLICT",
};
const DNSRecordType = {
    TXT: "TXT",
};
const DomainVerificationMethod = {
    DNS_TXT: "DNS_TXT",
    HTTP_ROUTE: "HTTP_ROUTE",
    PRIVATE_VPC: "PRIVATE_VPC",
};
const TargetDomainStatus = {
    FAILED: "FAILED",
    PENDING: "PENDING",
    UNREACHABLE: "UNREACHABLE",
    VERIFIED: "VERIFIED",
};
const ThreatActor = {
    AGENT: "AGENT",
    CUSTOMER: "CUSTOMER",
};
const ThreatSeverity = {
    CRITICAL: "CRITICAL",
    HIGH: "HIGH",
    INFO: "INFO",
    LOW: "LOW",
    MEDIUM: "MEDIUM",
};
const ThreatStatus = {
    DISMISSED: "DISMISSED",
    OPEN: "OPEN",
    RESOLVED: "RESOLVED",
};
const StrideCategory = {
    DENIAL_OF_SERVICE: "DENIAL_OF_SERVICE",
    ELEVATION_OF_PRIVILEGE: "ELEVATION_OF_PRIVILEGE",
    INFORMATION_DISCLOSURE: "INFORMATION_DISCLOSURE",
    REPUDIATION: "REPUDIATION",
    SPOOFING: "SPOOFING",
    TAMPERING: "TAMPERING",
};
const GitLabTokenType = {
    GROUP: "GROUP",
    PERSONAL: "PERSONAL",
};
const Provider = {
    BITBUCKET: "BITBUCKET",
    CONFLUENCE: "CONFLUENCE",
    GITHUB: "GITHUB",
    GITLAB: "GITLAB",
};
const UserRole = {
    MEMBER: "MEMBER",
};
const MembershipType = {
    USER: "USER",
};
const ResourceConfigDnsResolution = {
    IN_VPC: "IN_VPC",
    PUBLIC: "PUBLIC",
};
const IpAddressType = {
    DUAL_STACK: "DUAL_STACK",
    IPV4: "IPV4",
    IPV6: "IPV6",
};
const PrivateConnectionStatus = {
    ACTIVE: "ACTIVE",
    CREATE_FAILED: "CREATE_FAILED",
    CREATE_IN_PROGRESS: "CREATE_IN_PROGRESS",
    DELETE_FAILED: "DELETE_FAILED",
    DELETE_IN_PROGRESS: "DELETE_IN_PROGRESS",
};
const PrivateConnectionType = {
    SELF_MANAGED: "SELF_MANAGED",
    SERVICE_MANAGED: "SERVICE_MANAGED",
};
const SecurityRequirementPackStatus = {
    DISABLED: "DISABLED",
    ENABLED: "ENABLED",
};
const ProviderType = {
    DOCUMENTATION: "DOCUMENTATION",
    SOURCE_CODE: "SOURCE_CODE",
};
const SecurityRequirementPackImportStatus = {
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    IN_PROGRESS: "IN_PROGRESS",
    PENDING: "PENDING",
};
const ManagementType = {
    AWS_MANAGED: "AWS_MANAGED",
    CUSTOMER_MANAGED: "CUSTOMER_MANAGED",
};
const SecurityRequirementArtifactFormat = {
    DOC: "DOC",
    DOCX: "DOCX",
    MD: "MD",
    PDF: "PDF",
    TXT: "TXT",
};
const ResourceType = {
    CODE_REPOSITORY: "CODE_REPOSITORY",
    DOCUMENT: "DOCUMENT",
};
const MembershipTypeFilter = {
    ALL: "ALL",
    USER: "USER",
};

exports.AWSResources$ = AWSResources$;
exports.AccessDeniedException = AccessDeniedException;
exports.AccessDeniedException$ = AccessDeniedException$;
exports.AccessType = AccessType;
exports.Actor$ = Actor$;
exports.AddArtifact$ = AddArtifact$;
exports.AddArtifactCommand = AddArtifactCommand;
exports.AddArtifactInput$ = AddArtifactInput$;
exports.AddArtifactOutput$ = AddArtifactOutput$;
exports.AgentSpace$ = AgentSpace$;
exports.AgentSpaceSummary$ = AgentSpaceSummary$;
exports.ApplicationSummary$ = ApplicationSummary$;
exports.Artifact$ = Artifact$;
exports.ArtifactMetadataItem$ = ArtifactMetadataItem$;
exports.ArtifactSummary$ = ArtifactSummary$;
exports.ArtifactType = ArtifactType;
exports.Assets$ = Assets$;
exports.Authentication$ = Authentication$;
exports.AuthenticationProviderType = AuthenticationProviderType;
exports.BatchCreateSecurityRequirementResult$ = BatchCreateSecurityRequirementResult$;
exports.BatchCreateSecurityRequirements$ = BatchCreateSecurityRequirements$;
exports.BatchCreateSecurityRequirementsCommand = BatchCreateSecurityRequirementsCommand;
exports.BatchCreateSecurityRequirementsInput$ = BatchCreateSecurityRequirementsInput$;
exports.BatchCreateSecurityRequirementsOutput$ = BatchCreateSecurityRequirementsOutput$;
exports.BatchDeleteCodeReviews$ = BatchDeleteCodeReviews$;
exports.BatchDeleteCodeReviewsCommand = BatchDeleteCodeReviewsCommand;
exports.BatchDeleteCodeReviewsInput$ = BatchDeleteCodeReviewsInput$;
exports.BatchDeleteCodeReviewsOutput$ = BatchDeleteCodeReviewsOutput$;
exports.BatchDeletePentests$ = BatchDeletePentests$;
exports.BatchDeletePentestsCommand = BatchDeletePentestsCommand;
exports.BatchDeletePentestsInput$ = BatchDeletePentestsInput$;
exports.BatchDeletePentestsOutput$ = BatchDeletePentestsOutput$;
exports.BatchDeleteSecurityRequirements$ = BatchDeleteSecurityRequirements$;
exports.BatchDeleteSecurityRequirementsCommand = BatchDeleteSecurityRequirementsCommand;
exports.BatchDeleteSecurityRequirementsInput$ = BatchDeleteSecurityRequirementsInput$;
exports.BatchDeleteSecurityRequirementsOutput$ = BatchDeleteSecurityRequirementsOutput$;
exports.BatchDeleteThreatModels$ = BatchDeleteThreatModels$;
exports.BatchDeleteThreatModelsCommand = BatchDeleteThreatModelsCommand;
exports.BatchDeleteThreatModelsInput$ = BatchDeleteThreatModelsInput$;
exports.BatchDeleteThreatModelsOutput$ = BatchDeleteThreatModelsOutput$;
exports.BatchGetAgentSpaces$ = BatchGetAgentSpaces$;
exports.BatchGetAgentSpacesCommand = BatchGetAgentSpacesCommand;
exports.BatchGetAgentSpacesInput$ = BatchGetAgentSpacesInput$;
exports.BatchGetAgentSpacesOutput$ = BatchGetAgentSpacesOutput$;
exports.BatchGetArtifactMetadata$ = BatchGetArtifactMetadata$;
exports.BatchGetArtifactMetadataCommand = BatchGetArtifactMetadataCommand;
exports.BatchGetArtifactMetadataInput$ = BatchGetArtifactMetadataInput$;
exports.BatchGetArtifactMetadataOutput$ = BatchGetArtifactMetadataOutput$;
exports.BatchGetCodeReviewJobTasks$ = BatchGetCodeReviewJobTasks$;
exports.BatchGetCodeReviewJobTasksCommand = BatchGetCodeReviewJobTasksCommand;
exports.BatchGetCodeReviewJobTasksInput$ = BatchGetCodeReviewJobTasksInput$;
exports.BatchGetCodeReviewJobTasksOutput$ = BatchGetCodeReviewJobTasksOutput$;
exports.BatchGetCodeReviewJobs$ = BatchGetCodeReviewJobs$;
exports.BatchGetCodeReviewJobsCommand = BatchGetCodeReviewJobsCommand;
exports.BatchGetCodeReviewJobsInput$ = BatchGetCodeReviewJobsInput$;
exports.BatchGetCodeReviewJobsOutput$ = BatchGetCodeReviewJobsOutput$;
exports.BatchGetCodeReviews$ = BatchGetCodeReviews$;
exports.BatchGetCodeReviewsCommand = BatchGetCodeReviewsCommand;
exports.BatchGetCodeReviewsInput$ = BatchGetCodeReviewsInput$;
exports.BatchGetCodeReviewsOutput$ = BatchGetCodeReviewsOutput$;
exports.BatchGetFindings$ = BatchGetFindings$;
exports.BatchGetFindingsCommand = BatchGetFindingsCommand;
exports.BatchGetFindingsInput$ = BatchGetFindingsInput$;
exports.BatchGetFindingsOutput$ = BatchGetFindingsOutput$;
exports.BatchGetPentestJobTasks$ = BatchGetPentestJobTasks$;
exports.BatchGetPentestJobTasksCommand = BatchGetPentestJobTasksCommand;
exports.BatchGetPentestJobTasksInput$ = BatchGetPentestJobTasksInput$;
exports.BatchGetPentestJobTasksOutput$ = BatchGetPentestJobTasksOutput$;
exports.BatchGetPentestJobs$ = BatchGetPentestJobs$;
exports.BatchGetPentestJobsCommand = BatchGetPentestJobsCommand;
exports.BatchGetPentestJobsInput$ = BatchGetPentestJobsInput$;
exports.BatchGetPentestJobsOutput$ = BatchGetPentestJobsOutput$;
exports.BatchGetPentests$ = BatchGetPentests$;
exports.BatchGetPentestsCommand = BatchGetPentestsCommand;
exports.BatchGetPentestsInput$ = BatchGetPentestsInput$;
exports.BatchGetPentestsOutput$ = BatchGetPentestsOutput$;
exports.BatchGetSecurityRequirementResult$ = BatchGetSecurityRequirementResult$;
exports.BatchGetSecurityRequirements$ = BatchGetSecurityRequirements$;
exports.BatchGetSecurityRequirementsCommand = BatchGetSecurityRequirementsCommand;
exports.BatchGetSecurityRequirementsInput$ = BatchGetSecurityRequirementsInput$;
exports.BatchGetSecurityRequirementsOutput$ = BatchGetSecurityRequirementsOutput$;
exports.BatchGetTargetDomains$ = BatchGetTargetDomains$;
exports.BatchGetTargetDomainsCommand = BatchGetTargetDomainsCommand;
exports.BatchGetTargetDomainsInput$ = BatchGetTargetDomainsInput$;
exports.BatchGetTargetDomainsOutput$ = BatchGetTargetDomainsOutput$;
exports.BatchGetThreatModelJobTasks$ = BatchGetThreatModelJobTasks$;
exports.BatchGetThreatModelJobTasksCommand = BatchGetThreatModelJobTasksCommand;
exports.BatchGetThreatModelJobTasksInput$ = BatchGetThreatModelJobTasksInput$;
exports.BatchGetThreatModelJobTasksOutput$ = BatchGetThreatModelJobTasksOutput$;
exports.BatchGetThreatModelJobs$ = BatchGetThreatModelJobs$;
exports.BatchGetThreatModelJobsCommand = BatchGetThreatModelJobsCommand;
exports.BatchGetThreatModelJobsInput$ = BatchGetThreatModelJobsInput$;
exports.BatchGetThreatModelJobsOutput$ = BatchGetThreatModelJobsOutput$;
exports.BatchGetThreatModels$ = BatchGetThreatModels$;
exports.BatchGetThreatModelsCommand = BatchGetThreatModelsCommand;
exports.BatchGetThreatModelsInput$ = BatchGetThreatModelsInput$;
exports.BatchGetThreatModelsOutput$ = BatchGetThreatModelsOutput$;
exports.BatchGetThreats$ = BatchGetThreats$;
exports.BatchGetThreatsCommand = BatchGetThreatsCommand;
exports.BatchGetThreatsInput$ = BatchGetThreatsInput$;
exports.BatchGetThreatsOutput$ = BatchGetThreatsOutput$;
exports.BatchSecurityRequirementError$ = BatchSecurityRequirementError$;
exports.BatchUpdateSecurityRequirements$ = BatchUpdateSecurityRequirements$;
exports.BatchUpdateSecurityRequirementsCommand = BatchUpdateSecurityRequirementsCommand;
exports.BatchUpdateSecurityRequirementsInput$ = BatchUpdateSecurityRequirementsInput$;
exports.BatchUpdateSecurityRequirementsOutput$ = BatchUpdateSecurityRequirementsOutput$;
exports.BitbucketIntegrationInput$ = BitbucketIntegrationInput$;
exports.BitbucketRepositoryMetadata$ = BitbucketRepositoryMetadata$;
exports.BitbucketRepositoryResource$ = BitbucketRepositoryResource$;
exports.BitbucketResourceCapabilities$ = BitbucketResourceCapabilities$;
exports.CaCertificateSource$ = CaCertificateSource$;
exports.Category$ = Category$;
exports.CiCdConfiguration$ = CiCdConfiguration$;
exports.CleanUpStrategy = CleanUpStrategy;
exports.CloudWatchLog$ = CloudWatchLog$;
exports.CodeLocation$ = CodeLocation$;
exports.CodeRemediationStrategy = CodeRemediationStrategy;
exports.CodeRemediationTask$ = CodeRemediationTask$;
exports.CodeRemediationTaskDetails$ = CodeRemediationTaskDetails$;
exports.CodeRemediationTaskStatus = CodeRemediationTaskStatus;
exports.CodeReview$ = CodeReview$;
exports.CodeReviewJob$ = CodeReviewJob$;
exports.CodeReviewJobSummary$ = CodeReviewJobSummary$;
exports.CodeReviewJobTask$ = CodeReviewJobTask$;
exports.CodeReviewJobTaskSummary$ = CodeReviewJobTaskSummary$;
exports.CodeReviewSettings$ = CodeReviewSettings$;
exports.CodeReviewSummary$ = CodeReviewSummary$;
exports.ConfidenceLevel = ConfidenceLevel;
exports.ConflictException = ConflictException;
exports.ConflictException$ = ConflictException$;
exports.ConfluenceDocumentMetadata$ = ConfluenceDocumentMetadata$;
exports.ConfluenceDocumentResource$ = ConfluenceDocumentResource$;
exports.ConfluenceIntegrationInput$ = ConfluenceIntegrationInput$;
exports.ConfluenceResourceCapabilities$ = ConfluenceResourceCapabilities$;
exports.ContextType = ContextType;
exports.CreateAgentSpace$ = CreateAgentSpace$;
exports.CreateAgentSpaceCommand = CreateAgentSpaceCommand;
exports.CreateAgentSpaceInput$ = CreateAgentSpaceInput$;
exports.CreateAgentSpaceOutput$ = CreateAgentSpaceOutput$;
exports.CreateApplication$ = CreateApplication$;
exports.CreateApplicationCommand = CreateApplicationCommand;
exports.CreateApplicationRequest$ = CreateApplicationRequest$;
exports.CreateApplicationResponse$ = CreateApplicationResponse$;
exports.CreateCodeReview$ = CreateCodeReview$;
exports.CreateCodeReviewCommand = CreateCodeReviewCommand;
exports.CreateCodeReviewInput$ = CreateCodeReviewInput$;
exports.CreateCodeReviewOutput$ = CreateCodeReviewOutput$;
exports.CreateIntegration$ = CreateIntegration$;
exports.CreateIntegrationCommand = CreateIntegrationCommand;
exports.CreateIntegrationInput$ = CreateIntegrationInput$;
exports.CreateIntegrationOutput$ = CreateIntegrationOutput$;
exports.CreateMembership$ = CreateMembership$;
exports.CreateMembershipCommand = CreateMembershipCommand;
exports.CreateMembershipRequest$ = CreateMembershipRequest$;
exports.CreateMembershipResponse$ = CreateMembershipResponse$;
exports.CreatePentest$ = CreatePentest$;
exports.CreatePentestCommand = CreatePentestCommand;
exports.CreatePentestInput$ = CreatePentestInput$;
exports.CreatePentestOutput$ = CreatePentestOutput$;
exports.CreatePrivateConnection$ = CreatePrivateConnection$;
exports.CreatePrivateConnectionCommand = CreatePrivateConnectionCommand;
exports.CreatePrivateConnectionInput$ = CreatePrivateConnectionInput$;
exports.CreatePrivateConnectionOutput$ = CreatePrivateConnectionOutput$;
exports.CreateSecurityRequirementEntry$ = CreateSecurityRequirementEntry$;
exports.CreateSecurityRequirementPack$ = CreateSecurityRequirementPack$;
exports.CreateSecurityRequirementPackCommand = CreateSecurityRequirementPackCommand;
exports.CreateSecurityRequirementPackInput$ = CreateSecurityRequirementPackInput$;
exports.CreateSecurityRequirementPackOutput$ = CreateSecurityRequirementPackOutput$;
exports.CreateTargetDomain$ = CreateTargetDomain$;
exports.CreateTargetDomainCommand = CreateTargetDomainCommand;
exports.CreateTargetDomainInput$ = CreateTargetDomainInput$;
exports.CreateTargetDomainOutput$ = CreateTargetDomainOutput$;
exports.CreateThreat$ = CreateThreat$;
exports.CreateThreatCommand = CreateThreatCommand;
exports.CreateThreatInput$ = CreateThreatInput$;
exports.CreateThreatModel$ = CreateThreatModel$;
exports.CreateThreatModelCommand = CreateThreatModelCommand;
exports.CreateThreatModelInput$ = CreateThreatModelInput$;
exports.CreateThreatModelOutput$ = CreateThreatModelOutput$;
exports.CreateThreatOutput$ = CreateThreatOutput$;
exports.CustomHeader$ = CustomHeader$;
exports.DNSRecordType = DNSRecordType;
exports.DeleteAgentSpace$ = DeleteAgentSpace$;
exports.DeleteAgentSpaceCommand = DeleteAgentSpaceCommand;
exports.DeleteAgentSpaceInput$ = DeleteAgentSpaceInput$;
exports.DeleteAgentSpaceOutput$ = DeleteAgentSpaceOutput$;
exports.DeleteApplication$ = DeleteApplication$;
exports.DeleteApplicationCommand = DeleteApplicationCommand;
exports.DeleteApplicationRequest$ = DeleteApplicationRequest$;
exports.DeleteArtifact$ = DeleteArtifact$;
exports.DeleteArtifactCommand = DeleteArtifactCommand;
exports.DeleteArtifactInput$ = DeleteArtifactInput$;
exports.DeleteArtifactOutput$ = DeleteArtifactOutput$;
exports.DeleteCodeReviewFailure$ = DeleteCodeReviewFailure$;
exports.DeleteIntegration$ = DeleteIntegration$;
exports.DeleteIntegrationCommand = DeleteIntegrationCommand;
exports.DeleteIntegrationInput$ = DeleteIntegrationInput$;
exports.DeleteIntegrationOutput$ = DeleteIntegrationOutput$;
exports.DeleteMembership$ = DeleteMembership$;
exports.DeleteMembershipCommand = DeleteMembershipCommand;
exports.DeleteMembershipRequest$ = DeleteMembershipRequest$;
exports.DeleteMembershipResponse$ = DeleteMembershipResponse$;
exports.DeletePentestFailure$ = DeletePentestFailure$;
exports.DeletePrivateConnection$ = DeletePrivateConnection$;
exports.DeletePrivateConnectionCommand = DeletePrivateConnectionCommand;
exports.DeletePrivateConnectionInput$ = DeletePrivateConnectionInput$;
exports.DeletePrivateConnectionOutput$ = DeletePrivateConnectionOutput$;
exports.DeleteSecurityRequirementPack$ = DeleteSecurityRequirementPack$;
exports.DeleteSecurityRequirementPackCommand = DeleteSecurityRequirementPackCommand;
exports.DeleteSecurityRequirementPackInput$ = DeleteSecurityRequirementPackInput$;
exports.DeleteSecurityRequirementPackOutput$ = DeleteSecurityRequirementPackOutput$;
exports.DeleteTargetDomain$ = DeleteTargetDomain$;
exports.DeleteTargetDomainCommand = DeleteTargetDomainCommand;
exports.DeleteTargetDomainInput$ = DeleteTargetDomainInput$;
exports.DeleteTargetDomainOutput$ = DeleteTargetDomainOutput$;
exports.DeleteThreatModelFailure$ = DeleteThreatModelFailure$;
exports.DescribePrivateConnection$ = DescribePrivateConnection$;
exports.DescribePrivateConnectionCommand = DescribePrivateConnectionCommand;
exports.DescribePrivateConnectionInput$ = DescribePrivateConnectionInput$;
exports.DescribePrivateConnectionOutput$ = DescribePrivateConnectionOutput$;
exports.DiffSource$ = DiffSource$;
exports.DiscoveredEndpoint$ = DiscoveredEndpoint$;
exports.DnsVerification$ = DnsVerification$;
exports.DocumentInfo$ = DocumentInfo$;
exports.DomainVerificationMethod = DomainVerificationMethod;
exports.Endpoint$ = Endpoint$;
exports.ErrorCode = ErrorCode;
exports.ErrorInformation$ = ErrorInformation$;
exports.ExecutionContext$ = ExecutionContext$;
exports.Finding$ = Finding$;
exports.FindingStatus = FindingStatus;
exports.FindingSummary$ = FindingSummary$;
exports.GetApplication$ = GetApplication$;
exports.GetApplicationCommand = GetApplicationCommand;
exports.GetApplicationRequest$ = GetApplicationRequest$;
exports.GetApplicationResponse$ = GetApplicationResponse$;
exports.GetArtifact$ = GetArtifact$;
exports.GetArtifactCommand = GetArtifactCommand;
exports.GetArtifactInput$ = GetArtifactInput$;
exports.GetArtifactOutput$ = GetArtifactOutput$;
exports.GetIntegration$ = GetIntegration$;
exports.GetIntegrationCommand = GetIntegrationCommand;
exports.GetIntegrationInput$ = GetIntegrationInput$;
exports.GetIntegrationOutput$ = GetIntegrationOutput$;
exports.GetSecurityRequirementPack$ = GetSecurityRequirementPack$;
exports.GetSecurityRequirementPackCommand = GetSecurityRequirementPackCommand;
exports.GetSecurityRequirementPackInput$ = GetSecurityRequirementPackInput$;
exports.GetSecurityRequirementPackOutput$ = GetSecurityRequirementPackOutput$;
exports.GitHubIntegrationInput$ = GitHubIntegrationInput$;
exports.GitHubRepositoryMetadata$ = GitHubRepositoryMetadata$;
exports.GitHubRepositoryResource$ = GitHubRepositoryResource$;
exports.GitHubResourceCapabilities$ = GitHubResourceCapabilities$;
exports.GitLabIntegrationInput$ = GitLabIntegrationInput$;
exports.GitLabRepositoryMetadata$ = GitLabRepositoryMetadata$;
exports.GitLabRepositoryResource$ = GitLabRepositoryResource$;
exports.GitLabResourceCapabilities$ = GitLabResourceCapabilities$;
exports.GitLabTokenType = GitLabTokenType;
exports.HttpVerification$ = HttpVerification$;
exports.IdCConfiguration$ = IdCConfiguration$;
exports.ImportSecurityRequirements$ = ImportSecurityRequirements$;
exports.ImportSecurityRequirementsCommand = ImportSecurityRequirementsCommand;
exports.ImportSecurityRequirementsInput$ = ImportSecurityRequirementsInput$;
exports.ImportSecurityRequirementsOutput$ = ImportSecurityRequirementsOutput$;
exports.ImportSource$ = ImportSource$;
exports.InitiateProviderRegistration$ = InitiateProviderRegistration$;
exports.InitiateProviderRegistrationCommand = InitiateProviderRegistrationCommand;
exports.InitiateProviderRegistrationInput$ = InitiateProviderRegistrationInput$;
exports.InitiateProviderRegistrationOutput$ = InitiateProviderRegistrationOutput$;
exports.IntegratedDocument$ = IntegratedDocument$;
exports.IntegratedRepository$ = IntegratedRepository$;
exports.IntegratedResource$ = IntegratedResource$;
exports.IntegratedResourceInputItem$ = IntegratedResourceInputItem$;
exports.IntegratedResourceMetadata$ = IntegratedResourceMetadata$;
exports.IntegratedResourceSummary$ = IntegratedResourceSummary$;
exports.IntegrationFilter$ = IntegrationFilter$;
exports.IntegrationSummary$ = IntegrationSummary$;
exports.InternalServerException = InternalServerException;
exports.InternalServerException$ = InternalServerException$;
exports.IpAddressType = IpAddressType;
exports.JobStatus = JobStatus;
exports.JobType = JobType;
exports.ListAgentSpaces$ = ListAgentSpaces$;
exports.ListAgentSpacesCommand = ListAgentSpacesCommand;
exports.ListAgentSpacesInput$ = ListAgentSpacesInput$;
exports.ListAgentSpacesOutput$ = ListAgentSpacesOutput$;
exports.ListApplications$ = ListApplications$;
exports.ListApplicationsCommand = ListApplicationsCommand;
exports.ListApplicationsRequest$ = ListApplicationsRequest$;
exports.ListApplicationsResponse$ = ListApplicationsResponse$;
exports.ListArtifacts$ = ListArtifacts$;
exports.ListArtifactsCommand = ListArtifactsCommand;
exports.ListArtifactsInput$ = ListArtifactsInput$;
exports.ListArtifactsOutput$ = ListArtifactsOutput$;
exports.ListCodeReviewJobTasks$ = ListCodeReviewJobTasks$;
exports.ListCodeReviewJobTasksCommand = ListCodeReviewJobTasksCommand;
exports.ListCodeReviewJobTasksInput$ = ListCodeReviewJobTasksInput$;
exports.ListCodeReviewJobTasksOutput$ = ListCodeReviewJobTasksOutput$;
exports.ListCodeReviewJobsForCodeReview$ = ListCodeReviewJobsForCodeReview$;
exports.ListCodeReviewJobsForCodeReviewCommand = ListCodeReviewJobsForCodeReviewCommand;
exports.ListCodeReviewJobsForCodeReviewInput$ = ListCodeReviewJobsForCodeReviewInput$;
exports.ListCodeReviewJobsForCodeReviewOutput$ = ListCodeReviewJobsForCodeReviewOutput$;
exports.ListCodeReviews$ = ListCodeReviews$;
exports.ListCodeReviewsCommand = ListCodeReviewsCommand;
exports.ListCodeReviewsInput$ = ListCodeReviewsInput$;
exports.ListCodeReviewsOutput$ = ListCodeReviewsOutput$;
exports.ListDiscoveredEndpoints$ = ListDiscoveredEndpoints$;
exports.ListDiscoveredEndpointsCommand = ListDiscoveredEndpointsCommand;
exports.ListDiscoveredEndpointsInput$ = ListDiscoveredEndpointsInput$;
exports.ListDiscoveredEndpointsOutput$ = ListDiscoveredEndpointsOutput$;
exports.ListFindings$ = ListFindings$;
exports.ListFindingsCommand = ListFindingsCommand;
exports.ListFindingsInput$ = ListFindingsInput$;
exports.ListFindingsOutput$ = ListFindingsOutput$;
exports.ListIntegratedResources$ = ListIntegratedResources$;
exports.ListIntegratedResourcesCommand = ListIntegratedResourcesCommand;
exports.ListIntegratedResourcesInput$ = ListIntegratedResourcesInput$;
exports.ListIntegratedResourcesOutput$ = ListIntegratedResourcesOutput$;
exports.ListIntegrations$ = ListIntegrations$;
exports.ListIntegrationsCommand = ListIntegrationsCommand;
exports.ListIntegrationsInput$ = ListIntegrationsInput$;
exports.ListIntegrationsOutput$ = ListIntegrationsOutput$;
exports.ListMemberships$ = ListMemberships$;
exports.ListMembershipsCommand = ListMembershipsCommand;
exports.ListMembershipsRequest$ = ListMembershipsRequest$;
exports.ListMembershipsResponse$ = ListMembershipsResponse$;
exports.ListPentestJobTasks$ = ListPentestJobTasks$;
exports.ListPentestJobTasksCommand = ListPentestJobTasksCommand;
exports.ListPentestJobTasksInput$ = ListPentestJobTasksInput$;
exports.ListPentestJobTasksOutput$ = ListPentestJobTasksOutput$;
exports.ListPentestJobsForPentest$ = ListPentestJobsForPentest$;
exports.ListPentestJobsForPentestCommand = ListPentestJobsForPentestCommand;
exports.ListPentestJobsForPentestInput$ = ListPentestJobsForPentestInput$;
exports.ListPentestJobsForPentestOutput$ = ListPentestJobsForPentestOutput$;
exports.ListPentests$ = ListPentests$;
exports.ListPentestsCommand = ListPentestsCommand;
exports.ListPentestsInput$ = ListPentestsInput$;
exports.ListPentestsOutput$ = ListPentestsOutput$;
exports.ListPrivateConnections$ = ListPrivateConnections$;
exports.ListPrivateConnectionsCommand = ListPrivateConnectionsCommand;
exports.ListPrivateConnectionsInput$ = ListPrivateConnectionsInput$;
exports.ListPrivateConnectionsOutput$ = ListPrivateConnectionsOutput$;
exports.ListSecurityRequirementPackFilter$ = ListSecurityRequirementPackFilter$;
exports.ListSecurityRequirementPacks$ = ListSecurityRequirementPacks$;
exports.ListSecurityRequirementPacksCommand = ListSecurityRequirementPacksCommand;
exports.ListSecurityRequirementPacksInput$ = ListSecurityRequirementPacksInput$;
exports.ListSecurityRequirementPacksOutput$ = ListSecurityRequirementPacksOutput$;
exports.ListSecurityRequirements$ = ListSecurityRequirements$;
exports.ListSecurityRequirementsCommand = ListSecurityRequirementsCommand;
exports.ListSecurityRequirementsInput$ = ListSecurityRequirementsInput$;
exports.ListSecurityRequirementsOutput$ = ListSecurityRequirementsOutput$;
exports.ListTagsForResource$ = ListTagsForResource$;
exports.ListTagsForResourceCommand = ListTagsForResourceCommand;
exports.ListTagsForResourceInput$ = ListTagsForResourceInput$;
exports.ListTagsForResourceOutput$ = ListTagsForResourceOutput$;
exports.ListTargetDomains$ = ListTargetDomains$;
exports.ListTargetDomainsCommand = ListTargetDomainsCommand;
exports.ListTargetDomainsInput$ = ListTargetDomainsInput$;
exports.ListTargetDomainsOutput$ = ListTargetDomainsOutput$;
exports.ListThreatModelJobTasks$ = ListThreatModelJobTasks$;
exports.ListThreatModelJobTasksCommand = ListThreatModelJobTasksCommand;
exports.ListThreatModelJobTasksInput$ = ListThreatModelJobTasksInput$;
exports.ListThreatModelJobTasksOutput$ = ListThreatModelJobTasksOutput$;
exports.ListThreatModelJobs$ = ListThreatModelJobs$;
exports.ListThreatModelJobsCommand = ListThreatModelJobsCommand;
exports.ListThreatModelJobsInput$ = ListThreatModelJobsInput$;
exports.ListThreatModelJobsOutput$ = ListThreatModelJobsOutput$;
exports.ListThreatModels$ = ListThreatModels$;
exports.ListThreatModelsCommand = ListThreatModelsCommand;
exports.ListThreatModelsInput$ = ListThreatModelsInput$;
exports.ListThreatModelsOutput$ = ListThreatModelsOutput$;
exports.ListThreats$ = ListThreats$;
exports.ListThreatsCommand = ListThreatsCommand;
exports.ListThreatsInput$ = ListThreatsInput$;
exports.ListThreatsOutput$ = ListThreatsOutput$;
exports.LogLocation$ = LogLocation$;
exports.LogType = LogType;
exports.ManagementType = ManagementType;
exports.MemberMetadata$ = MemberMetadata$;
exports.MembershipConfig$ = MembershipConfig$;
exports.MembershipSummary$ = MembershipSummary$;
exports.MembershipType = MembershipType;
exports.MembershipTypeFilter = MembershipTypeFilter;
exports.NetworkTrafficConfig$ = NetworkTrafficConfig$;
exports.NetworkTrafficRule$ = NetworkTrafficRule$;
exports.NetworkTrafficRuleEffect = NetworkTrafficRuleEffect;
exports.NetworkTrafficRuleType = NetworkTrafficRuleType;
exports.Pentest$ = Pentest$;
exports.PentestJob$ = PentestJob$;
exports.PentestJobSummary$ = PentestJobSummary$;
exports.PentestSummary$ = PentestSummary$;
exports.PrivateConnectionMode$ = PrivateConnectionMode$;
exports.PrivateConnectionStatus = PrivateConnectionStatus;
exports.PrivateConnectionSummary$ = PrivateConnectionSummary$;
exports.PrivateConnectionType = PrivateConnectionType;
exports.Provider = Provider;
exports.ProviderInput$ = ProviderInput$;
exports.ProviderResourceCapabilities$ = ProviderResourceCapabilities$;
exports.ProviderType = ProviderType;
exports.ReportDestination$ = ReportDestination$;
exports.ResourceConfigDnsResolution = ResourceConfigDnsResolution;
exports.ResourceNotFoundException = ResourceNotFoundException;
exports.ResourceNotFoundException$ = ResourceNotFoundException$;
exports.ResourceType = ResourceType;
exports.RiskLevel = RiskLevel;
exports.RiskType = RiskType;
exports.ScopeChange$ = ScopeChange$;
exports.ScopeDecision = ScopeDecision;
exports.ScopeResult$ = ScopeResult$;
exports.SecurityAgent = SecurityAgent;
exports.SecurityAgentClient = SecurityAgentClient;
exports.SecurityAgentServiceException = SecurityAgentServiceException;
exports.SecurityAgentServiceException$ = SecurityAgentServiceException$;
exports.SecurityRequirementArtifact$ = SecurityRequirementArtifact$;
exports.SecurityRequirementArtifactFormat = SecurityRequirementArtifactFormat;
exports.SecurityRequirementPackImportStatus = SecurityRequirementPackImportStatus;
exports.SecurityRequirementPackStatus = SecurityRequirementPackStatus;
exports.SecurityRequirementPackSummary$ = SecurityRequirementPackSummary$;
exports.SecurityRequirementSummary$ = SecurityRequirementSummary$;
exports.SelfManagedInput$ = SelfManagedInput$;
exports.ServiceManagedInput$ = ServiceManagedInput$;
exports.ServiceQuotaExceededException = ServiceQuotaExceededException;
exports.ServiceQuotaExceededException$ = ServiceQuotaExceededException$;
exports.SkillType = SkillType;
exports.SourceCodeRepository$ = SourceCodeRepository$;
exports.StartCodeRemediation$ = StartCodeRemediation$;
exports.StartCodeRemediationCommand = StartCodeRemediationCommand;
exports.StartCodeRemediationInput$ = StartCodeRemediationInput$;
exports.StartCodeRemediationOutput$ = StartCodeRemediationOutput$;
exports.StartCodeReviewJob$ = StartCodeReviewJob$;
exports.StartCodeReviewJobCommand = StartCodeReviewJobCommand;
exports.StartCodeReviewJobInput$ = StartCodeReviewJobInput$;
exports.StartCodeReviewJobOutput$ = StartCodeReviewJobOutput$;
exports.StartPentestJob$ = StartPentestJob$;
exports.StartPentestJobCommand = StartPentestJobCommand;
exports.StartPentestJobInput$ = StartPentestJobInput$;
exports.StartPentestJobOutput$ = StartPentestJobOutput$;
exports.StartThreatModelJob$ = StartThreatModelJob$;
exports.StartThreatModelJobCommand = StartThreatModelJobCommand;
exports.StartThreatModelJobInput$ = StartThreatModelJobInput$;
exports.StartThreatModelJobOutput$ = StartThreatModelJobOutput$;
exports.Step$ = Step$;
exports.StepName = StepName;
exports.StepStatus = StepStatus;
exports.StopCodeReviewJob$ = StopCodeReviewJob$;
exports.StopCodeReviewJobCommand = StopCodeReviewJobCommand;
exports.StopCodeReviewJobInput$ = StopCodeReviewJobInput$;
exports.StopCodeReviewJobOutput$ = StopCodeReviewJobOutput$;
exports.StopPentestJob$ = StopPentestJob$;
exports.StopPentestJobCommand = StopPentestJobCommand;
exports.StopPentestJobInput$ = StopPentestJobInput$;
exports.StopPentestJobOutput$ = StopPentestJobOutput$;
exports.StopThreatModelJob$ = StopThreatModelJob$;
exports.StopThreatModelJobCommand = StopThreatModelJobCommand;
exports.StopThreatModelJobInput$ = StopThreatModelJobInput$;
exports.StopThreatModelJobOutput$ = StopThreatModelJobOutput$;
exports.StrideCategory = StrideCategory;
exports.TagResource$ = TagResource$;
exports.TagResourceCommand = TagResourceCommand;
exports.TagResourceInput$ = TagResourceInput$;
exports.TagResourceOutput$ = TagResourceOutput$;
exports.TargetDomain$ = TargetDomain$;
exports.TargetDomainStatus = TargetDomainStatus;
exports.TargetDomainSummary$ = TargetDomainSummary$;
exports.Task$ = Task$;
exports.TaskExecutionStatus = TaskExecutionStatus;
exports.TaskSummary$ = TaskSummary$;
exports.Threat$ = Threat$;
exports.ThreatActor = ThreatActor;
exports.ThreatAnchorShape$ = ThreatAnchorShape$;
exports.ThreatEvidenceShape$ = ThreatEvidenceShape$;
exports.ThreatModel$ = ThreatModel$;
exports.ThreatModelJob$ = ThreatModelJob$;
exports.ThreatModelJobSummary$ = ThreatModelJobSummary$;
exports.ThreatModelJobTask$ = ThreatModelJobTask$;
exports.ThreatModelJobTaskSummary$ = ThreatModelJobTaskSummary$;
exports.ThreatModelSummary$ = ThreatModelSummary$;
exports.ThreatSeverity = ThreatSeverity;
exports.ThreatStatus = ThreatStatus;
exports.ThreatSummary$ = ThreatSummary$;
exports.ThrottlingException = ThrottlingException;
exports.ThrottlingException$ = ThrottlingException$;
exports.TrustedCaCertificate$ = TrustedCaCertificate$;
exports.UntagResource$ = UntagResource$;
exports.UntagResourceCommand = UntagResourceCommand;
exports.UntagResourceInput$ = UntagResourceInput$;
exports.UntagResourceOutput$ = UntagResourceOutput$;
exports.UpdateAgentSpace$ = UpdateAgentSpace$;
exports.UpdateAgentSpaceCommand = UpdateAgentSpaceCommand;
exports.UpdateAgentSpaceInput$ = UpdateAgentSpaceInput$;
exports.UpdateAgentSpaceOutput$ = UpdateAgentSpaceOutput$;
exports.UpdateApplication$ = UpdateApplication$;
exports.UpdateApplicationCommand = UpdateApplicationCommand;
exports.UpdateApplicationRequest$ = UpdateApplicationRequest$;
exports.UpdateApplicationResponse$ = UpdateApplicationResponse$;
exports.UpdateCodeReview$ = UpdateCodeReview$;
exports.UpdateCodeReviewCommand = UpdateCodeReviewCommand;
exports.UpdateCodeReviewInput$ = UpdateCodeReviewInput$;
exports.UpdateCodeReviewOutput$ = UpdateCodeReviewOutput$;
exports.UpdateFinding$ = UpdateFinding$;
exports.UpdateFindingCommand = UpdateFindingCommand;
exports.UpdateFindingInput$ = UpdateFindingInput$;
exports.UpdateFindingOutput$ = UpdateFindingOutput$;
exports.UpdateIntegratedResources$ = UpdateIntegratedResources$;
exports.UpdateIntegratedResourcesCommand = UpdateIntegratedResourcesCommand;
exports.UpdateIntegratedResourcesInput$ = UpdateIntegratedResourcesInput$;
exports.UpdateIntegratedResourcesOutput$ = UpdateIntegratedResourcesOutput$;
exports.UpdatePentest$ = UpdatePentest$;
exports.UpdatePentestCommand = UpdatePentestCommand;
exports.UpdatePentestInput$ = UpdatePentestInput$;
exports.UpdatePentestOutput$ = UpdatePentestOutput$;
exports.UpdatePrivateConnectionCertificate$ = UpdatePrivateConnectionCertificate$;
exports.UpdatePrivateConnectionCertificateCommand = UpdatePrivateConnectionCertificateCommand;
exports.UpdatePrivateConnectionCertificateInput$ = UpdatePrivateConnectionCertificateInput$;
exports.UpdatePrivateConnectionCertificateOutput$ = UpdatePrivateConnectionCertificateOutput$;
exports.UpdateSecurityRequirementEntry$ = UpdateSecurityRequirementEntry$;
exports.UpdateSecurityRequirementPack$ = UpdateSecurityRequirementPack$;
exports.UpdateSecurityRequirementPackCommand = UpdateSecurityRequirementPackCommand;
exports.UpdateSecurityRequirementPackInput$ = UpdateSecurityRequirementPackInput$;
exports.UpdateSecurityRequirementPackOutput$ = UpdateSecurityRequirementPackOutput$;
exports.UpdateTargetDomain$ = UpdateTargetDomain$;
exports.UpdateTargetDomainCommand = UpdateTargetDomainCommand;
exports.UpdateTargetDomainInput$ = UpdateTargetDomainInput$;
exports.UpdateTargetDomainOutput$ = UpdateTargetDomainOutput$;
exports.UpdateThreat$ = UpdateThreat$;
exports.UpdateThreatCommand = UpdateThreatCommand;
exports.UpdateThreatInput$ = UpdateThreatInput$;
exports.UpdateThreatModel$ = UpdateThreatModel$;
exports.UpdateThreatModelCommand = UpdateThreatModelCommand;
exports.UpdateThreatModelInput$ = UpdateThreatModelInput$;
exports.UpdateThreatModelOutput$ = UpdateThreatModelOutput$;
exports.UpdateThreatOutput$ = UpdateThreatOutput$;
exports.UserConfig$ = UserConfig$;
exports.UserMetadata$ = UserMetadata$;
exports.UserRole = UserRole;
exports.ValidationException = ValidationException;
exports.ValidationException$ = ValidationException$;
exports.ValidationExceptionField$ = ValidationExceptionField$;
exports.ValidationMode = ValidationMode;
exports.ValidationStatus = ValidationStatus;
exports.VerificationDetails$ = VerificationDetails$;
exports.VerificationScript$ = VerificationScript$;
exports.VerificationScriptEnvVar$ = VerificationScriptEnvVar$;
exports.VerifyTargetDomain$ = VerifyTargetDomain$;
exports.VerifyTargetDomainCommand = VerifyTargetDomainCommand;
exports.VerifyTargetDomainInput$ = VerifyTargetDomainInput$;
exports.VerifyTargetDomainOutput$ = VerifyTargetDomainOutput$;
exports.VpcConfig$ = VpcConfig$;
exports.errorTypeRegistries = errorTypeRegistries;
exports.paginateListAgentSpaces = paginateListAgentSpaces;
exports.paginateListApplications = paginateListApplications;
exports.paginateListArtifacts = paginateListArtifacts;
exports.paginateListCodeReviewJobTasks = paginateListCodeReviewJobTasks;
exports.paginateListCodeReviewJobsForCodeReview = paginateListCodeReviewJobsForCodeReview;
exports.paginateListCodeReviews = paginateListCodeReviews;
exports.paginateListDiscoveredEndpoints = paginateListDiscoveredEndpoints;
exports.paginateListFindings = paginateListFindings;
exports.paginateListIntegratedResources = paginateListIntegratedResources;
exports.paginateListIntegrations = paginateListIntegrations;
exports.paginateListMemberships = paginateListMemberships;
exports.paginateListPentestJobTasks = paginateListPentestJobTasks;
exports.paginateListPentestJobsForPentest = paginateListPentestJobsForPentest;
exports.paginateListPentests = paginateListPentests;
exports.paginateListPrivateConnections = paginateListPrivateConnections;
exports.paginateListSecurityRequirementPacks = paginateListSecurityRequirementPacks;
exports.paginateListSecurityRequirements = paginateListSecurityRequirements;
exports.paginateListTargetDomains = paginateListTargetDomains;
exports.paginateListThreatModelJobTasks = paginateListThreatModelJobTasks;
exports.paginateListThreatModelJobs = paginateListThreatModelJobs;
exports.paginateListThreatModels = paginateListThreatModels;
exports.paginateListThreats = paginateListThreats;
