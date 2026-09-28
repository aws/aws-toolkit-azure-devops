import { createAggregatedClient } from "@smithy/core/client";
import { AddArtifactCommand, } from "./commands/AddArtifactCommand";
import { BatchCreateSecurityRequirementsCommand, } from "./commands/BatchCreateSecurityRequirementsCommand";
import { BatchDeleteCodeReviewsCommand, } from "./commands/BatchDeleteCodeReviewsCommand";
import { BatchDeletePentestsCommand, } from "./commands/BatchDeletePentestsCommand";
import { BatchDeleteSecurityRequirementsCommand, } from "./commands/BatchDeleteSecurityRequirementsCommand";
import { BatchDeleteThreatModelsCommand, } from "./commands/BatchDeleteThreatModelsCommand";
import { BatchGetAgentSpacesCommand, } from "./commands/BatchGetAgentSpacesCommand";
import { BatchGetArtifactMetadataCommand, } from "./commands/BatchGetArtifactMetadataCommand";
import { BatchGetCodeReviewJobsCommand, } from "./commands/BatchGetCodeReviewJobsCommand";
import { BatchGetCodeReviewJobTasksCommand, } from "./commands/BatchGetCodeReviewJobTasksCommand";
import { BatchGetCodeReviewsCommand, } from "./commands/BatchGetCodeReviewsCommand";
import { BatchGetFindingsCommand, } from "./commands/BatchGetFindingsCommand";
import { BatchGetPentestJobsCommand, } from "./commands/BatchGetPentestJobsCommand";
import { BatchGetPentestJobTasksCommand, } from "./commands/BatchGetPentestJobTasksCommand";
import { BatchGetPentestsCommand, } from "./commands/BatchGetPentestsCommand";
import { BatchGetSecurityRequirementsCommand, } from "./commands/BatchGetSecurityRequirementsCommand";
import { BatchGetTargetDomainsCommand, } from "./commands/BatchGetTargetDomainsCommand";
import { BatchGetThreatModelJobsCommand, } from "./commands/BatchGetThreatModelJobsCommand";
import { BatchGetThreatModelJobTasksCommand, } from "./commands/BatchGetThreatModelJobTasksCommand";
import { BatchGetThreatModelsCommand, } from "./commands/BatchGetThreatModelsCommand";
import { BatchGetThreatsCommand, } from "./commands/BatchGetThreatsCommand";
import { BatchUpdateSecurityRequirementsCommand, } from "./commands/BatchUpdateSecurityRequirementsCommand";
import { CreateAgentSpaceCommand, } from "./commands/CreateAgentSpaceCommand";
import { CreateApplicationCommand, } from "./commands/CreateApplicationCommand";
import { CreateCodeReviewCommand, } from "./commands/CreateCodeReviewCommand";
import { CreateIntegrationCommand, } from "./commands/CreateIntegrationCommand";
import { CreateMembershipCommand, } from "./commands/CreateMembershipCommand";
import { CreatePentestCommand, } from "./commands/CreatePentestCommand";
import { CreatePrivateConnectionCommand, } from "./commands/CreatePrivateConnectionCommand";
import { CreateSecurityRequirementPackCommand, } from "./commands/CreateSecurityRequirementPackCommand";
import { CreateTargetDomainCommand, } from "./commands/CreateTargetDomainCommand";
import { CreateThreatCommand, } from "./commands/CreateThreatCommand";
import { CreateThreatModelCommand, } from "./commands/CreateThreatModelCommand";
import { DeleteAgentSpaceCommand, } from "./commands/DeleteAgentSpaceCommand";
import { DeleteApplicationCommand, } from "./commands/DeleteApplicationCommand";
import { DeleteArtifactCommand, } from "./commands/DeleteArtifactCommand";
import { DeleteIntegrationCommand, } from "./commands/DeleteIntegrationCommand";
import { DeleteMembershipCommand, } from "./commands/DeleteMembershipCommand";
import { DeletePrivateConnectionCommand, } from "./commands/DeletePrivateConnectionCommand";
import { DeleteSecurityRequirementPackCommand, } from "./commands/DeleteSecurityRequirementPackCommand";
import { DeleteTargetDomainCommand, } from "./commands/DeleteTargetDomainCommand";
import { DescribePrivateConnectionCommand, } from "./commands/DescribePrivateConnectionCommand";
import { GetApplicationCommand, } from "./commands/GetApplicationCommand";
import { GetArtifactCommand, } from "./commands/GetArtifactCommand";
import { GetIntegrationCommand, } from "./commands/GetIntegrationCommand";
import { GetSecurityRequirementPackCommand, } from "./commands/GetSecurityRequirementPackCommand";
import { ImportSecurityRequirementsCommand, } from "./commands/ImportSecurityRequirementsCommand";
import { InitiateProviderRegistrationCommand, } from "./commands/InitiateProviderRegistrationCommand";
import { ListAgentSpacesCommand, } from "./commands/ListAgentSpacesCommand";
import { ListApplicationsCommand, } from "./commands/ListApplicationsCommand";
import { ListArtifactsCommand, } from "./commands/ListArtifactsCommand";
import { ListCodeReviewJobsForCodeReviewCommand, } from "./commands/ListCodeReviewJobsForCodeReviewCommand";
import { ListCodeReviewJobTasksCommand, } from "./commands/ListCodeReviewJobTasksCommand";
import { ListCodeReviewsCommand, } from "./commands/ListCodeReviewsCommand";
import { ListDiscoveredEndpointsCommand, } from "./commands/ListDiscoveredEndpointsCommand";
import { ListFindingsCommand, } from "./commands/ListFindingsCommand";
import { ListIntegratedResourcesCommand, } from "./commands/ListIntegratedResourcesCommand";
import { ListIntegrationsCommand, } from "./commands/ListIntegrationsCommand";
import { ListMembershipsCommand, } from "./commands/ListMembershipsCommand";
import { ListPentestJobsForPentestCommand, } from "./commands/ListPentestJobsForPentestCommand";
import { ListPentestJobTasksCommand, } from "./commands/ListPentestJobTasksCommand";
import { ListPentestsCommand, } from "./commands/ListPentestsCommand";
import { ListPrivateConnectionsCommand, } from "./commands/ListPrivateConnectionsCommand";
import { ListSecurityRequirementPacksCommand, } from "./commands/ListSecurityRequirementPacksCommand";
import { ListSecurityRequirementsCommand, } from "./commands/ListSecurityRequirementsCommand";
import { ListTagsForResourceCommand, } from "./commands/ListTagsForResourceCommand";
import { ListTargetDomainsCommand, } from "./commands/ListTargetDomainsCommand";
import { ListThreatModelJobsCommand, } from "./commands/ListThreatModelJobsCommand";
import { ListThreatModelJobTasksCommand, } from "./commands/ListThreatModelJobTasksCommand";
import { ListThreatModelsCommand, } from "./commands/ListThreatModelsCommand";
import { ListThreatsCommand, } from "./commands/ListThreatsCommand";
import { StartCodeRemediationCommand, } from "./commands/StartCodeRemediationCommand";
import { StartCodeReviewJobCommand, } from "./commands/StartCodeReviewJobCommand";
import { StartPentestJobCommand, } from "./commands/StartPentestJobCommand";
import { StartThreatModelJobCommand, } from "./commands/StartThreatModelJobCommand";
import { StopCodeReviewJobCommand, } from "./commands/StopCodeReviewJobCommand";
import { StopPentestJobCommand, } from "./commands/StopPentestJobCommand";
import { StopThreatModelJobCommand, } from "./commands/StopThreatModelJobCommand";
import { TagResourceCommand, } from "./commands/TagResourceCommand";
import { UntagResourceCommand, } from "./commands/UntagResourceCommand";
import { UpdateAgentSpaceCommand, } from "./commands/UpdateAgentSpaceCommand";
import { UpdateApplicationCommand, } from "./commands/UpdateApplicationCommand";
import { UpdateCodeReviewCommand, } from "./commands/UpdateCodeReviewCommand";
import { UpdateFindingCommand, } from "./commands/UpdateFindingCommand";
import { UpdateIntegratedResourcesCommand, } from "./commands/UpdateIntegratedResourcesCommand";
import { UpdatePentestCommand, } from "./commands/UpdatePentestCommand";
import { UpdatePrivateConnectionCertificateCommand, } from "./commands/UpdatePrivateConnectionCertificateCommand";
import { UpdateSecurityRequirementPackCommand, } from "./commands/UpdateSecurityRequirementPackCommand";
import { UpdateTargetDomainCommand, } from "./commands/UpdateTargetDomainCommand";
import { UpdateThreatCommand, } from "./commands/UpdateThreatCommand";
import { UpdateThreatModelCommand, } from "./commands/UpdateThreatModelCommand";
import { VerifyTargetDomainCommand, } from "./commands/VerifyTargetDomainCommand";
import { paginateListAgentSpaces } from "./pagination/ListAgentSpacesPaginator";
import { paginateListApplications } from "./pagination/ListApplicationsPaginator";
import { paginateListArtifacts } from "./pagination/ListArtifactsPaginator";
import { paginateListCodeReviewJobsForCodeReview } from "./pagination/ListCodeReviewJobsForCodeReviewPaginator";
import { paginateListCodeReviewJobTasks } from "./pagination/ListCodeReviewJobTasksPaginator";
import { paginateListCodeReviews } from "./pagination/ListCodeReviewsPaginator";
import { paginateListDiscoveredEndpoints } from "./pagination/ListDiscoveredEndpointsPaginator";
import { paginateListFindings } from "./pagination/ListFindingsPaginator";
import { paginateListIntegratedResources } from "./pagination/ListIntegratedResourcesPaginator";
import { paginateListIntegrations } from "./pagination/ListIntegrationsPaginator";
import { paginateListMemberships } from "./pagination/ListMembershipsPaginator";
import { paginateListPentestJobsForPentest } from "./pagination/ListPentestJobsForPentestPaginator";
import { paginateListPentestJobTasks } from "./pagination/ListPentestJobTasksPaginator";
import { paginateListPentests } from "./pagination/ListPentestsPaginator";
import { paginateListPrivateConnections } from "./pagination/ListPrivateConnectionsPaginator";
import { paginateListSecurityRequirementPacks } from "./pagination/ListSecurityRequirementPacksPaginator";
import { paginateListSecurityRequirements } from "./pagination/ListSecurityRequirementsPaginator";
import { paginateListTargetDomains } from "./pagination/ListTargetDomainsPaginator";
import { paginateListThreatModelJobs } from "./pagination/ListThreatModelJobsPaginator";
import { paginateListThreatModelJobTasks } from "./pagination/ListThreatModelJobTasksPaginator";
import { paginateListThreatModels } from "./pagination/ListThreatModelsPaginator";
import { paginateListThreats } from "./pagination/ListThreatsPaginator";
import { SecurityAgentClient } from "./SecurityAgentClient";
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
export class SecurityAgent extends SecurityAgentClient {
}
createAggregatedClient(commands, SecurityAgent, { paginators });
