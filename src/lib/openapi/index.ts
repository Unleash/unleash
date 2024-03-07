import { OpenAPIV3 } from 'openapi-types';
import {
    addonCreateUpdateSchema,
    addonParameterSchema,
    addonSchema,
    addonsSchema,
    addonTypeSchema,
    adminCountSchema,
    adminFeaturesQuerySchema,
    adminSegmentSchema,
    advancedPlaygroundFeatureSchema,
    advancedPlaygroundRequestSchema,
    advancedPlaygroundResponseSchema,
    apiTokenSchema,
    apiTokensSchema,
    applicationSchema,
    applicationsSchema,
    applicationUsageSchema,
    batchFeaturesSchema,
    bulkToggleFeaturesSchema,
    changePasswordSchema,
    clientApplicationSchema,
    clientFeatureSchema,
    clientFeaturesQuerySchema,
    clientFeaturesSchema,
    clientMetricsSchema,
    clientSegmentSchema,
    cloneFeatureSchema,
    constraintSchema,
    contextFieldSchema,
    contextFieldsSchema,
    createApiTokenSchema,
    createContextFieldSchema,
    createDependentFeatureSchema,
    createFeatureSchema,
    createFeatureStrategySchema,
    createGroupSchema,
    createInvitedUserSchema,
    createPatSchema,
    createStrategySchema,
    createStrategyVariantSchema,
    createUserResponseSchema,
    createUserSchema,
    dateSchema,
    dependenciesExistSchema,
    dependentFeatureSchema,
    deprecatedProjectOverviewSchema,
    doraFeaturesSchema,
    edgeTokenSchema,
    emailSchema,
    environmentProjectSchema,
    environmentSchema,
    environmentsProjectSchema,
    environmentsSchema,
    eventSchema,
    eventsSchema,
    exportQuerySchema,
    exportResultSchema,
    featureEnvironmentMetricsSchema,
    featureEnvironmentSchema,
    featureEventsSchema,
    featureMetricsSchema,
    featureSchema,
    featureSearchResponseSchema,
    featuresSchema,
    featureStrategySchema,
    featureStrategySegmentSchema,
    featureTagSchema,
    featureTypeCountSchema,
    featureTypeSchema,
    featureTypesSchema,
    featureUsageSchema,
    featureVariantsSchema,
    feedbackCreateSchema,
    feedbackResponseSchema,
    feedbackUpdateSchema,
    groupSchema,
    groupsSchema,
    groupUserModelSchema,
    healthCheckSchema,
    healthOverviewSchema,
    healthReportSchema,
    idSchema,
    idsSchema,
    importTogglesSchema,
    importTogglesValidateItemSchema,
    importTogglesValidateSchema,
    inactiveUserSchema,
    inactiveUsersSchema,
    instanceAdminStatsSchema,
    legalValueSchema,
    loginSchema,
    meSchema,
    nameSchema,
    overrideSchema,
    parametersSchema,
    parentFeatureOptionsSchema,
    passwordSchema,
    patchesSchema,
    patchSchema,
    patSchema,
    patsSchema,
    permissionSchema,
    playgroundConstraintSchema,
    playgroundFeatureSchema,
    playgroundRequestSchema,
    playgroundResponseSchema,
    playgroundSegmentSchema,
    playgroundStrategySchema,
    profileSchema,
    projectDoraMetricsSchema,
    projectEnvironmentSchema,
    projectOverviewSchema,
    projectSchema,
    projectsSchema,
    projectStatsSchema,
    proxyClientSchema,
    proxyFeatureSchema,
    proxyFeaturesSchema,
    publicSignupTokenCreateSchema,
    publicSignupTokenSchema,
    publicSignupTokensSchema,
    publicSignupTokenUpdateSchema,
    pushVariantsSchema,
    recordUiErrorSchema,
    requestsPerSecondSchema,
    requestsPerSecondSegmentedSchema,
    resetPasswordSchema,
    resourceLimitsSchema,
    roleSchema,
    sdkContextSchema,
    sdkFlatContextSchema,
    searchEventsSchema,
    searchFeaturesSchema,
    segmentSchema,
    segmentsSchema,
    setStrategySortOrderSchema,
    setUiConfigSchema,
    sortOrderSchema,
    splashRequestSchema,
    splashResponseSchema,
    stateSchema,
    strategiesSchema,
    strategySchema,
    strategyVariantSchema,
    tagsBulkAddSchema,
    tagSchema,
    tagsSchema,
    tagTypeSchema,
    tagTypesSchema,
    tagWithVersionSchema,
    telemetrySettingsSchema,
    tokenStringListSchema,
    tokenUserSchema,
    uiConfigSchema,
    updateApiTokenSchema,
    updateContextFieldSchema,
    updateFeatureSchema,
    updateFeatureStrategySchema,
    updateFeatureStrategySegmentsSchema,
    updateFeatureTypeLifetimeSchema,
    updateStrategySchema,
    updateTagTypeSchema,
    updateUserSchema,
    upsertSegmentSchema,
    userSchema,
    usersGroupsBaseSchema,
    usersSchema,
    usersSearchSchema,
    validateArchiveFeaturesSchema,
    validatedEdgeTokensSchema,
    validateFeatureSchema,
    validatePasswordSchema,
    validateTagTypeSchema,
    variantFlagSchema,
    variantSchema,
    variantsSchema,
    versionSchema,
} from './spec';
import { IServerOption } from '../types';
import { mapValues, omitKeys } from '../util';
import { openApiTags } from './util';
import { URL } from 'url';
import apiVersion from '../util/version';
import { maintenanceSchema } from './spec/maintenance-schema';
import { toggleMaintenanceSchema } from './spec/toggle-maintenance-schema';
import { bulkRegistrationSchema } from './spec/bulk-registration-schema';
import { bulkMetricsSchema } from './spec/bulk-metrics-schema';
import { clientMetricsEnvSchema } from './spec/client-metrics-env-schema';
import { updateTagsSchema } from './spec/update-tags-schema';
import { batchStaleSchema } from './spec/batch-stale-schema';
import { createApplicationSchema } from './spec/create-application-schema';
import { contextFieldStrategiesSchema } from './spec/context-field-strategies-schema';
import { advancedPlaygroundEnvironmentFeatureSchema } from './spec/advanced-playground-environment-feature-schema';
import { createFeatureNamingPatternSchema } from './spec/create-feature-naming-pattern-schema';
import { segmentStrategiesSchema } from './spec/segment-strategies-schema';
import { featureDependenciesSchema } from './spec/feature-dependencies-schema';
import { projectApplicationsSchema } from './spec/project-applications-schema';
import { projectApplicationSchema } from './spec/project-application-schema';
import { projectApplicationSdkSchema } from './spec/project-application-sdk-schema';
import { rolesSchema } from './spec/roles-schema';
import { applicationOverviewSchema } from './spec/application-overview-schema';
import { applicationOverviewEnvironmentSchema } from './spec/application-overview-environment-schema';
import { applicationOverviewIssuesSchema } from './spec/application-overview-issues-schema';
import { applicationEnvironmentInstancesSchema } from './spec/application-environment-instances-schema';
import { applicationEnvironmentIssuesSchema } from './spec/application-environment-issues-schema';

// Schemas must have an $id property on the form "#/components/schemas/mySchema".
export type SchemaId = (typeof schemas)[keyof typeof schemas]['$id'];

// Schemas must list all their $refs in `components`, including nested schemas.
export type SchemaRef = (typeof schemas)[keyof typeof schemas]['components'];

// JSON schema properties that should not be included in the OpenAPI spec.
export interface JsonSchemaProps {
    $id: string;
    components: object;
}

type SchemaWithMandatoryFields = Partial<
    Omit<
        OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
        '$id' | 'components'
    >
> &
    JsonSchemaProps;

interface UnleashSchemas {
    [name: string]: SchemaWithMandatoryFields;
}

interface OpenAPIV3DocumentWithServers extends OpenAPIV3.Document {
    servers: OpenAPIV3.ServerObject[];
}

// All schemas in `openapi/spec` should be listed here.
export const schemas: UnleashSchemas = {
    adminCountSchema,
    adminFeaturesQuerySchema,
    adminSegmentSchema,
    segmentStrategiesSchema,
    addonParameterSchema,
    addonSchema,
    addonCreateUpdateSchema,
    addonsSchema,
    addonTypeSchema,
    advancedPlaygroundEnvironmentFeatureSchema,
    advancedPlaygroundFeatureSchema,
    advancedPlaygroundRequestSchema,
    advancedPlaygroundResponseSchema,
    apiTokenSchema,
    apiTokensSchema,
    applicationSchema,
    applicationOverviewSchema,
    applicationOverviewIssuesSchema,
    applicationOverviewEnvironmentSchema,
    applicationEnvironmentInstancesSchema,
    applicationEnvironmentIssuesSchema,
    applicationUsageSchema,
    applicationsSchema,
    batchFeaturesSchema,
    batchStaleSchema,
    bulkRegistrationSchema,
    bulkMetricsSchema,
    bulkToggleFeaturesSchema,
    changePasswordSchema,
    clientApplicationSchema,
    clientFeatureSchema,
    clientFeaturesQuerySchema,
    clientFeaturesSchema,
    clientMetricsSchema,
    clientMetricsEnvSchema,
    cloneFeatureSchema,
    constraintSchema,
    contextFieldSchema,
    contextFieldsSchema,
    createApiTokenSchema,
    createApplicationSchema,
    createFeatureSchema,
    createFeatureStrategySchema,
    createInvitedUserSchema,
    createUserSchema,
    dateSchema,
    edgeTokenSchema,
    emailSchema,
    environmentSchema,
    environmentProjectSchema,
    environmentsSchema,
    environmentsProjectSchema,
    eventSchema,
    eventsSchema,
    exportResultSchema,
    exportQuerySchema,
    featureEnvironmentMetricsSchema,
    featureEnvironmentSchema,
    featureEventsSchema,
    featureMetricsSchema,
    featureSchema,
    featuresSchema,
    featureStrategySchema,
    featureStrategySegmentSchema,
    featureTagSchema,
    featureTypeSchema,
    featureTypesSchema,
    featureUsageSchema,
    featureVariantsSchema,
    feedbackCreateSchema,
    feedbackUpdateSchema,
    feedbackResponseSchema,
    groupSchema,
    groupsSchema,
    groupUserModelSchema,
    healthCheckSchema,
    healthOverviewSchema,
    healthReportSchema,
    idSchema,
    idsSchema,
    instanceAdminStatsSchema,
    legalValueSchema,
    loginSchema,
    maintenanceSchema,
    toggleMaintenanceSchema,
    meSchema,
    nameSchema,
    overrideSchema,
    parametersSchema,
    passwordSchema,
    patchesSchema,
    patchSchema,
    createPatSchema,
    patSchema,
    patsSchema,
    permissionSchema,
    playgroundConstraintSchema,
    playgroundFeatureSchema,
    playgroundRequestSchema,
    playgroundResponseSchema,
    playgroundSegmentSchema,
    playgroundStrategySchema,
    profileSchema,
    projectApplicationSchema,
    projectApplicationSdkSchema,
    projectApplicationsSchema,
    projectEnvironmentSchema,
    projectSchema,
    projectsSchema,
    proxyClientSchema,
    proxyFeatureSchema,
    proxyFeaturesSchema,
    publicSignupTokenCreateSchema,
    publicSignupTokenSchema,
    publicSignupTokensSchema,
    publicSignupTokenUpdateSchema,
    pushVariantsSchema,
    projectStatsSchema,
    resetPasswordSchema,
    requestsPerSecondSchema,
    requestsPerSecondSegmentedSchema,
    roleSchema,
    rolesSchema,
    sdkContextSchema,
    sdkFlatContextSchema,
    searchEventsSchema,
    segmentSchema,
    setStrategySortOrderSchema,
    setUiConfigSchema,
    sortOrderSchema,
    splashRequestSchema,
    splashResponseSchema,
    stateSchema,
    strategiesSchema,
    strategySchema,
    tagsBulkAddSchema,
    tagSchema,
    tagsSchema,
    tagTypeSchema,
    tagTypesSchema,
    tagWithVersionSchema,
    tokenUserSchema,
    tokenStringListSchema,
    uiConfigSchema,
    updateApiTokenSchema,
    updateFeatureSchema,
    updateFeatureStrategySchema,
    updateTagTypeSchema,
    updateUserSchema,
    updateTagsSchema,
    createContextFieldSchema,
    updateContextFieldSchema,
    upsertSegmentSchema,
    createStrategySchema,
    updateStrategySchema,
    updateFeatureTypeLifetimeSchema,
    userSchema,
    createUserResponseSchema,
    usersGroupsBaseSchema,
    usersSchema,
    usersSearchSchema,
    validatedEdgeTokensSchema,
    validateFeatureSchema,
    validatePasswordSchema,
    validateTagTypeSchema,
    variantSchema,
    variantFlagSchema,
    variantsSchema,
    versionSchema,
    deprecatedProjectOverviewSchema,
    importTogglesSchema,
    importTogglesValidateSchema,
    importTogglesValidateItemSchema,
    contextFieldStrategiesSchema,
    telemetrySettingsSchema,
    strategyVariantSchema,
    createStrategyVariantSchema,
    clientSegmentSchema,
    createGroupSchema,
    createFeatureNamingPatternSchema,
    doraFeaturesSchema,
    projectDoraMetricsSchema,
    segmentsSchema,
    updateFeatureStrategySegmentsSchema,
    dependentFeatureSchema,
    createDependentFeatureSchema,
    parentFeatureOptionsSchema,
    featureDependenciesSchema,
    dependenciesExistSchema,
    validateArchiveFeaturesSchema,
    searchFeaturesSchema,
    featureTypeCountSchema,
    projectOverviewSchema,
    featureSearchResponseSchema,
    inactiveUserSchema,
    inactiveUsersSchema,
    recordUiErrorSchema,
    resourceLimitsSchema,
};

// Remove JSONSchema keys that would result in an invalid OpenAPI spec.
export const removeJsonSchemaProps = <T extends JsonSchemaProps>(
    schema: T,
): OpenAPIV3.SchemaObject => {
    return omitKeys(schema, '$id', 'components');
};

const findRootUrl: (unleashUrl: string, baseUriPath: string) => string = (
    unleashUrl: string,
    baseUriPath?: string,
) => {
    if (!baseUriPath) {
        return unleashUrl;
    }
    const baseUrl = new URL(unleashUrl);
    const url =
        baseUrl.pathname.indexOf(baseUriPath) >= 0
            ? `${baseUrl.protocol}//${baseUrl.host}`
            : baseUrl.toString();

    return baseUriPath.startsWith('/')
        ? new URL(baseUriPath, url).toString()
        : url;
};

export const createOpenApiSchema = ({
    unleashUrl,
    baseUriPath,
}: Pick<IServerOption, 'unleashUrl' | 'baseUriPath'>): Omit<
    OpenAPIV3DocumentWithServers,
    'paths'
> => {
    const url = findRootUrl(unleashUrl, baseUriPath);

    return {
        openapi: '3.0.3',
        servers: baseUriPath ? [{ url }] : [],
        info: {
            title: 'Unleash API',
            version: apiVersion,
        },
        security: [{ apiKey: [] }],
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                },
            },
            schemas: mapValues(schemas, removeJsonSchemaProps),
        },
        tags: openApiTags,
    };
};

export * from './util';
export * from './spec';
