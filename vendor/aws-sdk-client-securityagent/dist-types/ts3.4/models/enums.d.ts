/**
 * @public
 * @enum
 */
export declare const AccessType: {
    /**
     * <p>Resource is private and has restricted access.</p>
     */
    readonly PRIVATE: "PRIVATE";
    /**
     * <p>Resource is public and openly accessible.</p>
     */
    readonly PUBLIC: "PUBLIC";
};
/**
 * @public
 */
export type AccessType = (typeof AccessType)[keyof typeof AccessType];
/**
 * @public
 * @enum
 */
export declare const AuthenticationProviderType: {
    /**
     * <p>Authentication using an AWS IAM role.</p>
     */
    readonly AWS_IAM_ROLE: "AWS_IAM_ROLE";
    /**
     * <p>Internal AWS authentication.</p>
     */
    readonly AWS_INTERNAL: "AWS_INTERNAL";
    /**
     * <p>Credentials retrieved via AWS Lambda function.</p>
     */
    readonly AWS_LAMBDA: "AWS_LAMBDA";
    /**
     * <p>Credentials stored in AWS Secrets Manager.</p>
     */
    readonly SECRETS_MANAGER: "SECRETS_MANAGER";
};
/**
 * @public
 */
export type AuthenticationProviderType = (typeof AuthenticationProviderType)[keyof typeof AuthenticationProviderType];
/**
 * @public
 * @enum
 */
export declare const ArtifactType: {
    readonly DOC: "DOC";
    readonly DOCX: "DOCX";
    readonly JPEG: "JPEG";
    readonly JSON: "JSON";
    readonly MD: "MD";
    readonly PDF: "PDF";
    readonly PNG: "PNG";
    readonly TXT: "TXT";
    readonly YAML: "YAML";
};
/**
 * @public
 */
export type ArtifactType = (typeof ArtifactType)[keyof typeof ArtifactType];
/**
 * @public
 * @enum
 */
export declare const CleanUpStrategy: {
    /**
     * <p>Attempt to delete resources created during the pentest on a best-effort basis.</p>
     */
    readonly BEST_EFFORT_DELETE: "BEST_EFFORT_DELETE";
    /**
     * <p>Retain all resources created during the pentest.</p>
     */
    readonly RETAIN_ALL: "RETAIN_ALL";
};
/**
 * @public
 */
export type CleanUpStrategy = (typeof CleanUpStrategy)[keyof typeof CleanUpStrategy];
/**
 * @public
 * @enum
 */
export declare const CodeRemediationStrategy: {
    /**
     * <p>Automatically generate code remediation for findings.</p>
     */
    readonly AUTOMATIC: "AUTOMATIC";
    /**
     * <p>Code remediation is disabled.</p>
     */
    readonly DISABLED: "DISABLED";
};
/**
 * @public
 */
export type CodeRemediationStrategy = (typeof CodeRemediationStrategy)[keyof typeof CodeRemediationStrategy];
/**
 * @public
 * @enum
 */
export declare const SkillType: {
    /**
     * <p>The finding personalization skill learns customer preferences from finding edits and aligns future findings accordingly.</p>
     */
    readonly FINDING_PERSONALIZATION: "FINDING_PERSONALIZATION";
    /**
     * <p>The login optimization skill learns application login flows to improve authentication success across runs.</p>
     */
    readonly LOGIN_OPTIMIZATION: "LOGIN_OPTIMIZATION";
};
/**
 * @public
 */
export type SkillType = (typeof SkillType)[keyof typeof SkillType];
/**
 * @public
 * @enum
 */
export declare const RiskType: {
    /**
     * <p>Arbitrary file upload vulnerability.</p>
     */
    readonly ARBITRARY_FILE_UPLOAD: "ARBITRARY_FILE_UPLOAD";
    /**
     * <p>Business logic vulnerability.</p>
     */
    readonly BUSINESS_LOGIC_VULNERABILITIES: "BUSINESS_LOGIC_VULNERABILITIES";
    /**
     * <p>Code injection vulnerability.</p>
     */
    readonly CODE_INJECTION: "CODE_INJECTION";
    /**
     * <p>Command injection vulnerability.</p>
     */
    readonly COMMAND_INJECTION: "COMMAND_INJECTION";
    /**
     * <p>Cross-site scripting vulnerability.</p>
     */
    readonly CROSS_SITE_SCRIPTING: "CROSS_SITE_SCRIPTING";
    /**
     * <p>Cryptographic vulnerability.</p>
     */
    readonly CRYPTOGRAPHIC_VULNERABILITIES: "CRYPTOGRAPHIC_VULNERABILITIES";
    /**
     * <p>Unauthorized database access.</p>
     */
    readonly DATABASE_ACCESS: "DATABASE_ACCESS";
    /**
     * <p>Unauthorized database modification.</p>
     */
    readonly DATABASE_MODIFICATION: "DATABASE_MODIFICATION";
    /**
     * <p>Default or weak credentials detected.</p>
     */
    readonly DEFAULT_CREDENTIALS: "DEFAULT_CREDENTIALS";
    /**
     * <p>Denial of service vulnerability.</p>
     */
    readonly DENIAL_OF_SERVICE: "DENIAL_OF_SERVICE";
    /**
     * <p>Unauthorized file access vulnerability.</p>
     */
    readonly FILE_ACCESS: "FILE_ACCESS";
    /**
     * <p>Unauthorized file creation vulnerability.</p>
     */
    readonly FILE_CREATION: "FILE_CREATION";
    /**
     * <p>File deletion vulnerability.</p>
     */
    readonly FILE_DELETION: "FILE_DELETION";
    /**
     * <p>GraphQL-specific vulnerability.</p>
     */
    readonly GRAPHQL_VULNERABILITIES: "GRAPHQL_VULNERABILITIES";
    /**
     * <p>Information disclosure vulnerability.</p>
     */
    readonly INFORMATION_DISCLOSURE: "INFORMATION_DISCLOSURE";
    /**
     * <p>Insecure deserialization vulnerability.</p>
     */
    readonly INSECURE_DESERIALIZATION: "INSECURE_DESERIALIZATION";
    /**
     * <p>Insecure direct object reference vulnerability.</p>
     */
    readonly INSECURE_DIRECT_OBJECT_REFERENCE: "INSECURE_DIRECT_OBJECT_REFERENCE";
    /**
     * <p>JSON Web Token vulnerability.</p>
     */
    readonly JSON_WEB_TOKEN_VULNERABILITIES: "JSON_WEB_TOKEN_VULNERABILITIES";
    /**
     * <p>Local file inclusion vulnerability.</p>
     */
    readonly LOCAL_FILE_INCLUSION: "LOCAL_FILE_INCLUSION";
    /**
     * <p>Other risk type not covered by specific categories.</p>
     */
    readonly OTHER: "OTHER";
    /**
     * <p>Outbound service request vulnerability.</p>
     */
    readonly OUTBOUND_SERVICE_REQUEST: "OUTBOUND_SERVICE_REQUEST";
    /**
     * <p>Path traversal vulnerability.</p>
     */
    readonly PATH_TRAVERSAL: "PATH_TRAVERSAL";
    /**
     * <p>Privilege escalation vulnerability.</p>
     */
    readonly PRIVILEGE_ESCALATION: "PRIVILEGE_ESCALATION";
    /**
     * <p>Server-side request forgery vulnerability.</p>
     */
    readonly SERVER_SIDE_REQUEST_FORGERY: "SERVER_SIDE_REQUEST_FORGERY";
    /**
     * <p>Server-side template injection vulnerability.</p>
     */
    readonly SERVER_SIDE_TEMPLATE_INJECTION: "SERVER_SIDE_TEMPLATE_INJECTION";
    /**
     * <p>SQL injection vulnerability.</p>
     */
    readonly SQL_INJECTION: "SQL_INJECTION";
    /**
     * <p>Unknown risk type.</p>
     */
    readonly UNKNOWN: "UNKNOWN";
    /**
     * <p>XML external entity vulnerability.</p>
     */
    readonly XML_EXTERNAL_ENTITY: "XML_EXTERNAL_ENTITY";
};
/**
 * @public
 */
export type RiskType = (typeof RiskType)[keyof typeof RiskType];
/**
 * @public
 * @enum
 */
export declare const NetworkTrafficRuleEffect: {
    /**
     * <p>Allow matching traffic.</p>
     */
    readonly ALLOW: "ALLOW";
    /**
     * <p>Deny matching traffic.</p>
     */
    readonly DENY: "DENY";
};
/**
 * @public
 */
export type NetworkTrafficRuleEffect = (typeof NetworkTrafficRuleEffect)[keyof typeof NetworkTrafficRuleEffect];
/**
 * @public
 * @enum
 */
export declare const NetworkTrafficRuleType: {
    /**
     * <p>URL-based traffic rule.</p>
     */
    readonly URL: "URL";
};
/**
 * @public
 */
export type NetworkTrafficRuleType = (typeof NetworkTrafficRuleType)[keyof typeof NetworkTrafficRuleType];
/**
 * @public
 * @enum
 */
export declare const ErrorCode: {
    /**
     * <p>Failure caused by a client-side error.</p>
     */
    readonly CLIENT_ERROR: "CLIENT_ERROR";
    /**
     * <p>Failure caused by an internal error.</p>
     */
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    /**
     * <p>Pentest job was stopped by the user.</p>
     */
    readonly STOPPED_BY_USER: "STOPPED_BY_USER";
};
/**
 * @public
 */
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
/**
 * @public
 * @enum
 */
export declare const ContextType: {
    /**
     * <p>Client-side error encountered during execution.</p>
     */
    readonly CLIENT_ERROR: "CLIENT_ERROR";
    /**
     * <p>Error encountered during execution.</p>
     */
    readonly ERROR: "ERROR";
    /**
     * <p>Informational message during execution.</p>
     */
    readonly INFO: "INFO";
    /**
     * <p>Warning encountered during execution.</p>
     */
    readonly WARNING: "WARNING";
};
/**
 * @public
 */
export type ContextType = (typeof ContextType)[keyof typeof ContextType];
/**
 * @public
 * @enum
 */
export declare const JobStatus: {
    /**
     * <p>Pentest job completed successfully.</p>
     */
    readonly COMPLETED: "COMPLETED";
    /**
     * <p>Pentest job failed during execution.</p>
     */
    readonly FAILED: "FAILED";
    /**
     * <p>Pentest job is currently running.</p>
     */
    readonly IN_PROGRESS: "IN_PROGRESS";
    /**
     * <p>Pentest job was stopped by the user.</p>
     */
    readonly STOPPED: "STOPPED";
    /**
     * <p>Pentest job is being stopped.</p>
     */
    readonly STOPPING: "STOPPING";
};
/**
 * @public
 */
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
/**
 * @public
 * @enum
 */
export declare const StepName: {
    /**
     * <p>Cleanup of infrastructure and resources created by the agent.</p>
     */
    readonly FINALIZING: "FINALIZING";
    /**
     * <p>Active pentest step.</p>
     */
    readonly PENTEST: "PENTEST";
    /**
     * <p>Pre-flight validation and setup step.</p>
     */
    readonly PREFLIGHT: "PREFLIGHT";
    /**
     * <p>Static code and network scan analysis step.</p>
     */
    readonly STATIC_ANALYSIS: "STATIC_ANALYSIS";
    /**
     * <p>Simulated validation step that dynamically confirms vulnerability exploitability.</p>
     */
    readonly VALIDATION: "VALIDATION";
};
/**
 * @public
 */
export type StepName = (typeof StepName)[keyof typeof StepName];
/**
 * @public
 * @enum
 */
export declare const StepStatus: {
    /**
     * <p>Step completed successfully.</p>
     */
    readonly COMPLETED: "COMPLETED";
    /**
     * <p>Step failed during execution.</p>
     */
    readonly FAILED: "FAILED";
    /**
     * <p>Step is currently running.</p>
     */
    readonly IN_PROGRESS: "IN_PROGRESS";
    /**
     * <p>Step has not started yet.</p>
     */
    readonly NOT_STARTED: "NOT_STARTED";
    /**
     * <p>Step was stopped by the user.</p>
     */
    readonly STOPPED: "STOPPED";
};
/**
 * @public
 */
export type StepStatus = (typeof StepStatus)[keyof typeof StepStatus];
/**
 * @public
 * @enum
 */
export declare const TaskExecutionStatus: {
    /**
     * <p>Task was aborted.</p>
     */
    readonly ABORTED: "ABORTED";
    /**
     * <p>Task completed successfully.</p>
     */
    readonly COMPLETED: "COMPLETED";
    /**
     * <p>Task failed during execution.</p>
     */
    readonly FAILED: "FAILED";
    /**
     * <p>Task failed due to an internal error.</p>
     */
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    /**
     * <p>Task is currently running.</p>
     */
    readonly IN_PROGRESS: "IN_PROGRESS";
};
/**
 * @public
 */
export type TaskExecutionStatus = (typeof TaskExecutionStatus)[keyof typeof TaskExecutionStatus];
/**
 * @public
 * @enum
 */
export declare const LogType: {
    /**
     * <p>Logs stored in CloudWatch.</p>
     */
    readonly CLOUDWATCH: "CLOUDWATCH";
};
/**
 * @public
 */
export type LogType = (typeof LogType)[keyof typeof LogType];
/**
 * @public
 * @enum
 */
export declare const ValidationMode: {
    readonly DISABLED: "DISABLED";
    readonly SIMULATED: "SIMULATED";
};
/**
 * @public
 */
export type ValidationMode = (typeof ValidationMode)[keyof typeof ValidationMode];
/**
 * @public
 * @enum
 */
export declare const CodeRemediationTaskStatus: {
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly IN_PROGRESS: "IN_PROGRESS";
};
/**
 * @public
 */
export type CodeRemediationTaskStatus = (typeof CodeRemediationTaskStatus)[keyof typeof CodeRemediationTaskStatus];
/**
 * @public
 * @enum
 */
export declare const ConfidenceLevel: {
    readonly FALSE_POSITIVE: "FALSE_POSITIVE";
    readonly HIGH: "HIGH";
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly UNCONFIRMED: "UNCONFIRMED";
};
/**
 * @public
 */
export type ConfidenceLevel = (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel];
/**
 * @public
 * @enum
 */
export declare const RiskLevel: {
    readonly CRITICAL: "CRITICAL";
    readonly HIGH: "HIGH";
    readonly INFORMATIONAL: "INFORMATIONAL";
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly UNKNOWN: "UNKNOWN";
};
/**
 * @public
 */
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];
/**
 * @public
 * @enum
 */
export declare const FindingStatus: {
    readonly ACCEPTED: "ACCEPTED";
    readonly ACTIVE: "ACTIVE";
    readonly FALSE_POSITIVE: "FALSE_POSITIVE";
    readonly RESOLVED: "RESOLVED";
};
/**
 * @public
 */
export type FindingStatus = (typeof FindingStatus)[keyof typeof FindingStatus];
/**
 * @public
 * @enum
 */
export declare const ValidationStatus: {
    readonly CONFIRMED: "CONFIRMED";
    readonly NOT_REPRODUCED: "NOT_REPRODUCED";
    readonly NOT_VALIDATED: "NOT_VALIDATED";
    readonly VALIDATING: "VALIDATING";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
};
/**
 * @public
 */
export type ValidationStatus = (typeof ValidationStatus)[keyof typeof ValidationStatus];
/**
 * @public
 * @enum
 */
export declare const JobType: {
    readonly CICD: "CICD";
    /**
     * <p>A full pentest job that executes all phases including scanning, managed execution, and guided exploration.</p>
     */
    readonly FULL: "FULL";
    /**
     * <p>A targeted revalidation job that retests specific findings to determine whether they are still exploitable.</p>
     */
    readonly REVALIDATION: "REVALIDATION";
};
/**
 * @public
 */
export type JobType = (typeof JobType)[keyof typeof JobType];
/**
 * @public
 * @enum
 */
export declare const ScopeDecision: {
    readonly IN_SCOPE: "IN_SCOPE";
    readonly SCOPED_OUT: "SCOPED_OUT";
    readonly SCOPE_CONFLICT: "SCOPE_CONFLICT";
};
/**
 * @public
 */
export type ScopeDecision = (typeof ScopeDecision)[keyof typeof ScopeDecision];
/**
 * @public
 * @enum
 */
export declare const DNSRecordType: {
    /**
     * <p>DNS TXT record.</p>
     */
    readonly TXT: "TXT";
};
/**
 * @public
 */
export type DNSRecordType = (typeof DNSRecordType)[keyof typeof DNSRecordType];
/**
 * @public
 * @enum
 */
export declare const DomainVerificationMethod: {
    /**
     * <p>Verify ownership via DNS TXT record.</p>
     */
    readonly DNS_TXT: "DNS_TXT";
    /**
     * <p>Verify ownership via HTTP route.</p>
     */
    readonly HTTP_ROUTE: "HTTP_ROUTE";
    /**
     * <p>Verify ownership via IP for private VPC pentests.</p>
     */
    readonly PRIVATE_VPC: "PRIVATE_VPC";
};
/**
 * @public
 */
export type DomainVerificationMethod = (typeof DomainVerificationMethod)[keyof typeof DomainVerificationMethod];
/**
 * @public
 * @enum
 */
export declare const TargetDomainStatus: {
    /**
     * <p>Domain verification failed.</p>
     */
    readonly FAILED: "FAILED";
    /**
     * <p>Domain verification is pending.</p>
     */
    readonly PENDING: "PENDING";
    /**
     * <p>Domain is unreachable for verification.</p>
     */
    readonly UNREACHABLE: "UNREACHABLE";
    /**
     * <p>Domain ownership has been verified.</p>
     */
    readonly VERIFIED: "VERIFIED";
};
/**
 * @public
 */
export type TargetDomainStatus = (typeof TargetDomainStatus)[keyof typeof TargetDomainStatus];
/**
 * @public
 * @enum
 */
export declare const ThreatActor: {
    /**
     * <p>Threat was created or updated by an agent.</p>
     */
    readonly AGENT: "AGENT";
    /**
     * <p>Threat was created or updated by a customer.</p>
     */
    readonly CUSTOMER: "CUSTOMER";
};
/**
 * @public
 */
export type ThreatActor = (typeof ThreatActor)[keyof typeof ThreatActor];
/**
 * @public
 * @enum
 */
export declare const ThreatSeverity: {
    readonly CRITICAL: "CRITICAL";
    readonly HIGH: "HIGH";
    readonly INFO: "INFO";
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
};
/**
 * @public
 */
export type ThreatSeverity = (typeof ThreatSeverity)[keyof typeof ThreatSeverity];
/**
 * @public
 * @enum
 */
export declare const ThreatStatus: {
    readonly DISMISSED: "DISMISSED";
    readonly OPEN: "OPEN";
    readonly RESOLVED: "RESOLVED";
};
/**
 * @public
 */
export type ThreatStatus = (typeof ThreatStatus)[keyof typeof ThreatStatus];
/**
 * @public
 * @enum
 */
export declare const StrideCategory: {
    readonly DENIAL_OF_SERVICE: "DENIAL_OF_SERVICE";
    readonly ELEVATION_OF_PRIVILEGE: "ELEVATION_OF_PRIVILEGE";
    readonly INFORMATION_DISCLOSURE: "INFORMATION_DISCLOSURE";
    readonly REPUDIATION: "REPUDIATION";
    readonly SPOOFING: "SPOOFING";
    readonly TAMPERING: "TAMPERING";
};
/**
 * @public
 */
export type StrideCategory = (typeof StrideCategory)[keyof typeof StrideCategory];
/**
 * @public
 * @enum
 */
export declare const GitLabTokenType: {
    readonly GROUP: "GROUP";
    readonly PERSONAL: "PERSONAL";
};
/**
 * @public
 */
export type GitLabTokenType = (typeof GitLabTokenType)[keyof typeof GitLabTokenType];
/**
 * @public
 * @enum
 */
export declare const Provider: {
    readonly BITBUCKET: "BITBUCKET";
    readonly CONFLUENCE: "CONFLUENCE";
    readonly GITHUB: "GITHUB";
    readonly GITLAB: "GITLAB";
};
/**
 * @public
 */
export type Provider = (typeof Provider)[keyof typeof Provider];
/**
 * @public
 * @enum
 */
export declare const UserRole: {
    /**
     * <p>Default member role with standard permissions.</p>
     */
    readonly MEMBER: "MEMBER";
};
/**
 * @public
 */
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
/**
 * @public
 * @enum
 */
export declare const MembershipType: {
    /**
     * <p>Human user member.</p>
     */
    readonly USER: "USER";
};
/**
 * @public
 */
export type MembershipType = (typeof MembershipType)[keyof typeof MembershipType];
/**
 * @public
 * @enum
 */
export declare const ResourceConfigDnsResolution: {
    readonly IN_VPC: "IN_VPC";
    readonly PUBLIC: "PUBLIC";
};
/**
 * @public
 */
export type ResourceConfigDnsResolution = (typeof ResourceConfigDnsResolution)[keyof typeof ResourceConfigDnsResolution];
/**
 * @public
 * @enum
 */
export declare const IpAddressType: {
    readonly DUAL_STACK: "DUAL_STACK";
    readonly IPV4: "IPV4";
    readonly IPV6: "IPV6";
};
/**
 * @public
 */
export type IpAddressType = (typeof IpAddressType)[keyof typeof IpAddressType];
/**
 * @public
 * @enum
 */
export declare const PrivateConnectionStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly CREATE_FAILED: "CREATE_FAILED";
    readonly CREATE_IN_PROGRESS: "CREATE_IN_PROGRESS";
    readonly DELETE_FAILED: "DELETE_FAILED";
    readonly DELETE_IN_PROGRESS: "DELETE_IN_PROGRESS";
};
/**
 * @public
 */
export type PrivateConnectionStatus = (typeof PrivateConnectionStatus)[keyof typeof PrivateConnectionStatus];
/**
 * @public
 * @enum
 */
export declare const PrivateConnectionType: {
    readonly SELF_MANAGED: "SELF_MANAGED";
    readonly SERVICE_MANAGED: "SERVICE_MANAGED";
};
/**
 * @public
 */
export type PrivateConnectionType = (typeof PrivateConnectionType)[keyof typeof PrivateConnectionType];
/**
 * @public
 * @enum
 */
export declare const SecurityRequirementPackStatus: {
    readonly DISABLED: "DISABLED";
    readonly ENABLED: "ENABLED";
};
/**
 * @public
 */
export type SecurityRequirementPackStatus = (typeof SecurityRequirementPackStatus)[keyof typeof SecurityRequirementPackStatus];
/**
 * @public
 * @enum
 */
export declare const ProviderType: {
    readonly DOCUMENTATION: "DOCUMENTATION";
    readonly SOURCE_CODE: "SOURCE_CODE";
};
/**
 * @public
 */
export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType];
/**
 * @public
 * @enum
 */
export declare const SecurityRequirementPackImportStatus: {
    readonly COMPLETED: "COMPLETED";
    readonly FAILED: "FAILED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly PENDING: "PENDING";
};
/**
 * @public
 */
export type SecurityRequirementPackImportStatus = (typeof SecurityRequirementPackImportStatus)[keyof typeof SecurityRequirementPackImportStatus];
/**
 * @public
 * @enum
 */
export declare const ManagementType: {
    readonly AWS_MANAGED: "AWS_MANAGED";
    readonly CUSTOMER_MANAGED: "CUSTOMER_MANAGED";
};
/**
 * @public
 */
export type ManagementType = (typeof ManagementType)[keyof typeof ManagementType];
/**
 * @public
 * @enum
 */
export declare const SecurityRequirementArtifactFormat: {
    readonly DOC: "DOC";
    readonly DOCX: "DOCX";
    readonly MD: "MD";
    readonly PDF: "PDF";
    readonly TXT: "TXT";
};
/**
 * @public
 */
export type SecurityRequirementArtifactFormat = (typeof SecurityRequirementArtifactFormat)[keyof typeof SecurityRequirementArtifactFormat];
/**
 * @public
 * @enum
 */
export declare const ResourceType: {
    readonly CODE_REPOSITORY: "CODE_REPOSITORY";
    readonly DOCUMENT: "DOCUMENT";
};
/**
 * @public
 */
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
/**
 * @public
 * @enum
 */
export declare const MembershipTypeFilter: {
    /**
     * <p>Show all member types.</p>
     */
    readonly ALL: "ALL";
    /**
     * <p>Show only user members.</p>
     */
    readonly USER: "USER";
};
/**
 * @public
 */
export type MembershipTypeFilter = (typeof MembershipTypeFilter)[keyof typeof MembershipTypeFilter];
