import { OpenAPIV3 } from 'openapi-types';
import { cloneFeatureSchema } from './spec/clone-feature-schema';
import { constraintSchema } from './spec/constraint-schema';
import { createFeatureSchema } from './spec/create-feature-schema';
import { createStrategySchema } from './spec/create-strategy-schema';
import { emptySchema } from './spec/empty-schema';
import { featureEnvironmentSchema } from './spec/feature-environment-schema';
import { featureSchema } from './spec/feature-schema';
import { featureStrategySchema } from './spec/feature-strategy-schema';
import { featureVariantsSchema } from './spec/feature-variants-schema';
import { featuresSchema } from './spec/features-schema';
import { mapValues } from '../util/map-values';
import { omitKeys } from '../util/omit-keys';
import { overrideSchema } from './spec/override-schema';
import { parametersSchema } from './spec/parameters-schema';
import { patchSchema } from './spec/patch-schema';
import { patchesSchema } from './spec/patches-schema';
import { strategySchema } from './spec/strategy-schema';
import { tagSchema } from './spec/tag-schema';
import { tagsSchema } from './spec/tags-schema';
import { uiConfigSchema } from './spec/ui-config-schema';
import { updateFeatureSchema } from './spec/update-feature-schema';
import { updateStrategySchema } from './spec/update-strategy-schema';
import { variantSchema } from './spec/variant-schema';
import { variantsSchema } from './spec/variants-schema';
import { versionSchema } from './spec/version-schema';

// Schemas must have $id property on the form "#/components/schemas/mySchema".
export type SchemaId = typeof schemas[keyof typeof schemas]['$id'];

// Schemas must list all $ref schemas in "components", including nested schemas.
export type SchemaRef = typeof schemas[keyof typeof schemas]['components'];

export interface AdminApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['admin'];
}

export interface ClientApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['client'];
}

export const schemas = {
    cloneFeatureSchema,
    constraintSchema,
    createFeatureSchema,
    createStrategySchema,
    emptySchema,
    featureEnvironmentSchema,
    featureSchema,
    featureStrategySchema,
    featureVariantsSchema,
    featuresSchema,
    overrideSchema,
    parametersSchema,
    patchSchema,
    patchesSchema,
    strategySchema,
    tagSchema,
    tagsSchema,
    uiConfigSchema,
    updateFeatureSchema,
    updateStrategySchema,
    variantSchema,
    variantsSchema,
    versionSchema,
};

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
            schemas: mapValues(schemas, (schema) =>
                omitKeys(schema, '$id', 'components'),
            ),
        },
    };
};
