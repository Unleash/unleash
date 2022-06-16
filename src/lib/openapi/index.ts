import { OpenAPIV3 } from 'openapi-types';
import { apiTokenSchema } from './spec/api-token-schema';
import { apiTokensSchema } from './spec/api-tokens-schema';
import { cloneFeatureSchema } from './spec/clone-feature-schema';
import { constraintSchema } from './spec/constraint-schema';
import { contextFieldSchema } from './spec/context-field-schema';
import { contextFieldsSchema } from './spec/context-fields-schema';
import { createApiTokenSchema } from './spec/create-api-token-schema';
import { createFeatureSchema } from './spec/create-feature-schema';
import { createStrategySchema } from './spec/create-strategy-schema';
import { environmentSchema } from './spec/environment-schema';
import { environmentsSchema } from './spec/environments-schema';
import { featureEnvironmentSchema } from './spec/feature-environment-schema';
import { featureSchema } from './spec/feature-schema';
import { featureStrategySchema } from './spec/feature-strategy-schema';
import { featureTypeSchema } from './spec/feature-type-schema';
import { featureTypesSchema } from './spec/feature-types-schema';
import { featureVariantsSchema } from './spec/feature-variants-schema';
import { featuresSchema } from './spec/features-schema';
import { feedbackSchema } from './spec/feedback-schema';
import { healthCheckSchema } from './spec/health-check-schema';
import { healthOverviewSchema } from './spec/health-overview-schema';
import { healthReportSchema } from './spec/health-report-schema';
import { legalValueSchema } from './spec/legal-value-schema';
import { mapValues } from '../util/map-values';
import { nameSchema } from './spec/name-schema';
import { omitKeys } from '../util/omit-keys';
import { overrideSchema } from './spec/override-schema';
import { parametersSchema } from './spec/parameters-schema';
import { patchSchema } from './spec/patch-schema';
import { patchesSchema } from './spec/patches-schema';
import { projectEnvironmentSchema } from './spec/project-environment-schema';
import { projectSchema } from './spec/project-schema';
import { projectsSchema } from './spec/projects-schema';
import { sortOrderSchema } from './spec/sort-order-schema';
import { splashSchema } from './spec/splash-schema';
import { strategySchema } from './spec/strategy-schema';
import { tagSchema } from './spec/tag-schema';
import { tagsSchema } from './spec/tags-schema';
import { tagTypeSchema } from './spec/tag-type-schema';
import { tagTypesSchema } from './spec/tag-types-schema';
import { uiConfigSchema } from './spec/ui-config-schema';
import { updateFeatureSchema } from './spec/update-feature-schema';
import { updateStrategySchema } from './spec/update-strategy-schema';
import { updateApiTokenSchema } from './spec/update-api-token-schema';
import { updateTagTypeSchema } from './spec/update-tag-type-schema';
import { upsertContextFieldSchema } from './spec/upsert-context-field-schema';
import { validateTagTypeSchema } from './spec/validate-tag-type-schema';
import { variantSchema } from './spec/variant-schema';
import { variantsSchema } from './spec/variants-schema';
import { versionSchema } from './spec/version-schema';
import { tagTypeSchema } from './spec/tag-type-schema';
import { tagTypesSchema } from './spec/tag-types-schema';
import { updateTagTypeSchema } from './spec/update-tag-type-schema';
import { validateTagTypeSchema } from './spec/validate-tag-type-schema';
import { applicationSchema } from './spec/application-schema';
import { applicationsSchema } from './spec/applications-schema';
import { tagWithVersionSchema } from './spec/tag-with-version-schema';

// All schemas in `openapi/spec` should be listed here.
export const schemas = {
    apiTokenSchema,
    apiTokensSchema,
    applicationSchema,
    applicationsSchema,
    cloneFeatureSchema,
    constraintSchema,
    contextFieldSchema,
    contextFieldsSchema,
    createApiTokenSchema,
    createFeatureSchema,
    createStrategySchema,
    environmentSchema,
    environmentsSchema,
    featureEnvironmentSchema,
    featureSchema,
    featureStrategySchema,
    featureTypeSchema,
    featureTypesSchema,
    featureVariantsSchema,
    featuresSchema,
    feedbackSchema,
    healthCheckSchema,
    healthOverviewSchema,
    healthReportSchema,
    legalValueSchema,
    nameSchema,
    overrideSchema,
    parametersSchema,
    patchSchema,
    patchesSchema,
    projectEnvironmentSchema,
    projectSchema,
    projectsSchema,
    sortOrderSchema,
    splashSchema,
    strategySchema,
    tagSchema,
    tagWithVersionSchema,
    tagsSchema,
    tagTypeSchema,
    tagTypesSchema,
    uiConfigSchema,
    updateFeatureSchema,
    updateStrategySchema,
    updateApiTokenSchema,
    updateTagTypeSchema,
    upsertContextFieldSchema,
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

interface ApiOperation<Tag = 'client' | 'admin' | 'other'>
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    operationId: string;
    tags: [Tag];
}

export type AdminApiOperation = ApiOperation<'admin'>;
export type ClientApiOperation = ApiOperation<'client'>;
export type OtherApiOperation = ApiOperation<'other'>;

export const createRequestSchema = (
    schemaName: string,
): OpenAPIV3.RequestBodyObject => {
    return {
        description: schemaName,
        required: true,
        content: {
            'application/json': {
                schema: {
                    $ref: `#/components/schemas/${schemaName}`,
                },
            },
        },
    };
};

export const createResponseSchema = (
    schemaName: string,
): OpenAPIV3.ResponseObject => {
    return {
        description: schemaName,
        content: {
            'application/json': {
                schema: {
                    $ref: `#/components/schemas/${schemaName}`,
                },
            },
        },
    };
};

// Remove JSONSchema keys that would result in an invalid OpenAPI spec.
export const removeJsonSchemaProps = <T extends JsonSchemaProps>(
    schema: T,
): OpenAPIV3.SchemaObject => {
    return omitKeys(schema, '$id', 'components');
};

export const createOpenApiSchema = (
    serverUrl?: string,
): Omit<OpenAPIV3.Document, 'paths'> => {
    return {
        openapi: '3.0.3',
        servers: serverUrl ? [{ url: serverUrl }] : [],
        info: {
            title: 'Unleash API',
            version: process.env.npm_package_version!,
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
    };
};
