import { OpenAPIV3 } from 'openapi-types';
import { addonParameterSchema } from './spec/addon-parameter-schema';
import { addonSchema } from './spec/addon-schema';
import { addonsSchema } from './spec/addons-schema';
import { addonTypeSchema } from './spec/addon-type-schema';
import { apiTokenSchema } from './spec/api-token-schema';
import { apiTokensSchema } from './spec/api-tokens-schema';
import { applicationSchema } from './spec/application-schema';
import { applicationsSchema } from './spec/applications-schema';
import { changePasswordSchema } from './spec/change-password-schema';
import { clientApplicationSchema } from './spec/client-application-schema';
import { clientFeatureSchema } from './spec/client-feature-schema';
import { clientFeaturesQuerySchema } from './spec/client-features-query-schema';
import { clientFeaturesSchema } from './spec/client-features-schema';
import { clientMetricsSchema } from './spec/client-metrics-schema';
import { cloneFeatureSchema } from './spec/clone-feature-schema';
import { constraintSchema } from './spec/constraint-schema';
import { contextFieldSchema } from './spec/context-field-schema';
import { contextFieldsSchema } from './spec/context-fields-schema';
import { createApiTokenSchema } from './spec/create-api-token-schema';
import { createFeatureSchema } from './spec/create-feature-schema';
import { createFeatureStrategySchema } from './spec/create-feature-strategy-schema';
import { createInvitedUserSchema } from './spec/create-invited-user-schema';
import { createUserSchema } from './spec/create-user-schema';
import { dateSchema } from './spec/date-schema';
import { edgeTokenSchema } from './spec/edge-token-schema';
import { emailSchema } from './spec/email-schema';
import { environmentSchema } from './spec/environment-schema';
import { environmentsSchema } from './spec/environments-schema';
import { eventSchema } from './spec/event-schema';
import { eventsSchema } from './spec/events-schema';
import { featureEnvironmentMetricsSchema } from './spec/feature-environment-metrics-schema';
import { featureEnvironmentSchema } from './spec/feature-environment-schema';
import { featureEventsSchema } from './spec/feature-events-schema';
import { featureMetricsSchema } from './spec/feature-metrics-schema';
import { featureSchema } from './spec/feature-schema';
import { featuresSchema } from './spec/features-schema';
import { featureStrategySchema } from './spec/feature-strategy-schema';
import { featureStrategySegmentSchema } from './spec/feature-strategy-segment-schema';
import { featureTagSchema } from './spec/feature-tag-schema';
import { featureTypeSchema } from './spec/feature-type-schema';
import { featureTypesSchema } from './spec/feature-types-schema';
import { featureUsageSchema } from './spec/feature-usage-schema';
import { featureVariantsSchema } from './spec/feature-variants-schema';
import { feedbackSchema } from './spec/feedback-schema';
import { groupSchema } from './spec/group-schema';
import { groupsSchema } from './spec/groups-schema';
import { groupUserModelSchema } from './spec/group-user-model-schema';
import { healthCheckSchema } from './spec/health-check-schema';
import { healthOverviewSchema } from './spec/health-overview-schema';
import { healthReportSchema } from './spec/health-report-schema';
import { idSchema } from './spec/id-schema';
import { IServerOption } from '../types';
import { legalValueSchema } from './spec/legal-value-schema';
import { loginSchema } from './spec/login-schema';
import { mapValues } from '../util/map-values';
import { meSchema } from './spec/me-schema';
import { nameSchema } from './spec/name-schema';
import { omitKeys } from '../util/omit-keys';
import { openApiTags } from './util/openapi-tags';
import { overrideSchema } from './spec/override-schema';
import { parametersSchema } from './spec/parameters-schema';
import { passwordSchema } from './spec/password-schema';
import { patchesSchema } from './spec/patches-schema';
import { patchSchema } from './spec/patch-schema';
import { patSchema } from './spec/pat-schema';
import { patsSchema } from './spec/pats-schema';
import { permissionSchema } from './spec/permission-schema';
import { playgroundConstraintSchema } from './spec/playground-constraint-schema';
import { playgroundFeatureSchema } from './spec/playground-feature-schema';
import { playgroundRequestSchema } from './spec/playground-request-schema';
import { playgroundResponseSchema } from './spec/playground-response-schema';
import { playgroundSegmentSchema } from './spec/playground-segment-schema';
import { playgroundStrategySchema } from './spec/playground-strategy-schema';
import { profileSchema } from './spec/profile-schema';
import { projectEnvironmentSchema } from './spec/project-environment-schema';
import { projectSchema } from './spec/project-schema';
import { projectsSchema } from './spec/projects-schema';
import { proxyClientSchema } from './spec/proxy-client-schema';
import { proxyFeatureSchema } from './spec/proxy-feature-schema';
import { proxyFeaturesSchema } from './spec/proxy-features-schema';
import { proxyMetricsSchema } from './spec/proxy-metrics-schema';
import { publicSignupTokenCreateSchema } from './spec/public-signup-token-create-schema';
import { publicSignupTokenSchema } from './spec/public-signup-token-schema';
import { publicSignupTokensSchema } from './spec/public-signup-tokens-schema';
import { publicSignupTokenUpdateSchema } from './spec/public-signup-token-update-schema';
import { resetPasswordSchema } from './spec/reset-password-schema';
import { roleSchema } from './spec/role-schema';
import { sdkContextSchema } from './spec/sdk-context-schema';
import { searchEventsSchema } from './spec/search-events-schema';
import { segmentSchema } from './spec/segment-schema';
import { setStrategySortOrderSchema } from './spec/set-strategy-sort-order-schema';
import { setUiConfigSchema } from './spec/set-ui-config-schema';
import { sortOrderSchema } from './spec/sort-order-schema';
import { splashSchema } from './spec/splash-schema';
import { stateSchema } from './spec/state-schema';
import { strategiesSchema } from './spec/strategies-schema';
import { strategySchema } from './spec/strategy-schema';
import { tagSchema } from './spec/tag-schema';
import { tagsSchema } from './spec/tags-schema';
import { tagTypeSchema } from './spec/tag-type-schema';
import { tagTypesSchema } from './spec/tag-types-schema';
import { tagWithVersionSchema } from './spec/tag-with-version-schema';
import { tokenUserSchema } from './spec/token-user-schema';
import { uiConfigSchema } from './spec/ui-config-schema';
import { updateApiTokenSchema } from './spec/update-api-token-schema';
import { updateFeatureSchema } from './spec/update-feature-schema';
import { updateFeatureStrategySchema } from './spec/update-feature-strategy-schema';
import { updateTagTypeSchema } from './spec/update-tag-type-schema';
import { updateUserSchema } from './spec/update-user-schema';
import { upsertContextFieldSchema } from './spec/upsert-context-field-schema';
import { upsertStrategySchema } from './spec/upsert-strategy-schema';
import { URL } from 'url';
import { userSchema } from './spec/user-schema';
import { usersGroupsBaseSchema } from './spec/users-groups-base-schema';
import { usersSchema } from './spec/users-schema';
import { usersSearchSchema } from './spec/users-search-schema';
import { validateEdgeTokensSchema } from './spec/validate-edge-tokens-schema';
import { validatePasswordSchema } from './spec/validate-password-schema';
import { validateTagTypeSchema } from './spec/validate-tag-type-schema';
import { variantSchema } from './spec/variant-schema';
import { variantsSchema } from './spec/variants-schema';
import { versionSchema } from './spec/version-schema';
import apiVersion from '../util/version';

// All schemas in `openapi/spec` should be listed here.
export const schemas = {
    addonParameterSchema,
    addonSchema,
    addonsSchema,
    addonTypeSchema,
    apiTokenSchema,
    apiTokensSchema,
    applicationSchema,
    applicationsSchema,
    changePasswordSchema,
    clientApplicationSchema,
    clientFeatureSchema,
    clientFeaturesQuerySchema,
    clientFeaturesSchema,
    clientMetricsSchema,
    cloneFeatureSchema,
    constraintSchema,
    contextFieldSchema,
    contextFieldsSchema,
    createApiTokenSchema,
    createFeatureSchema,
    createFeatureStrategySchema,
    createInvitedUserSchema,
    createUserSchema,
    dateSchema,
    edgeTokenSchema,
    emailSchema,
    environmentSchema,
    environmentsSchema,
    eventSchema,
    eventsSchema,
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
    feedbackSchema,
    groupSchema,
    groupsSchema,
    groupUserModelSchema,
    healthCheckSchema,
    healthOverviewSchema,
    healthReportSchema,
    idSchema,
    legalValueSchema,
    loginSchema,
    meSchema,
    nameSchema,
    overrideSchema,
    parametersSchema,
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
    projectEnvironmentSchema,
    projectSchema,
    projectsSchema,
    proxyClientSchema,
    proxyFeatureSchema,
    proxyFeaturesSchema,
    proxyMetricsSchema,
    publicSignupTokenCreateSchema,
    publicSignupTokenSchema,
    publicSignupTokensSchema,
    publicSignupTokenUpdateSchema,
    resetPasswordSchema,
    roleSchema,
    sdkContextSchema,
    searchEventsSchema,
    segmentSchema,
    setStrategySortOrderSchema,
    setUiConfigSchema,
    sortOrderSchema,
    splashSchema,
    stateSchema,
    strategiesSchema,
    strategySchema,
    tagSchema,
    tagsSchema,
    tagTypeSchema,
    tagTypesSchema,
    tagWithVersionSchema,
    tokenUserSchema,
    uiConfigSchema,
    updateApiTokenSchema,
    updateFeatureSchema,
    updateFeatureStrategySchema,
    updateTagTypeSchema,
    updateUserSchema,
    upsertContextFieldSchema,
    upsertStrategySchema,
    userSchema,
    usersGroupsBaseSchema,
    usersSchema,
    usersSearchSchema,
    validateEdgeTokensSchema,
    validatePasswordSchema,
    validateTagTypeSchema,
    variantSchema,
    variantsSchema,
    versionSchema,
};

// Schemas must have an $id property on the form "#/components/schemas/mySchema".
export type SchemaId = typeof schemas[keyof typeof schemas]['$id'];

// Schemas must list all their $refs in `components`, including nested schemas.
export type SchemaRef = typeof schemas[keyof typeof schemas]['components'];

// JSON schema properties that should not be included in the OpenAPI spec.
export interface JsonSchemaProps {
    $id: string;
    components: object;
}

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
    if (baseUrl.pathname.indexOf(baseUriPath) >= 0) {
        return `${baseUrl.protocol}//${baseUrl.host}`;
    }
    return baseUrl.toString();
};

export const createOpenApiSchema = ({
    unleashUrl,
    baseUriPath,
}: Pick<IServerOption, 'unleashUrl' | 'baseUriPath'>): Omit<
    OpenAPIV3.Document,
    'paths'
> => {
    const url = findRootUrl(unleashUrl, baseUriPath);
    return {
        openapi: '3.0.3',
        servers: url ? [{ url }] : [],
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
