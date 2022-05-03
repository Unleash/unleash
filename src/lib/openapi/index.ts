import { OpenAPIV3 } from 'openapi-types';
import { constraintSchema } from './spec/constraint-schema';
import { createFeatureSchema } from './spec/create-feature-schema';
import { featureSchema } from './spec/feature-schema';
import { featuresSchema } from './spec/features-schema';
import { overrideSchema } from './spec/override-schema';
import { parametersSchema } from './spec/parameters-schema';
import { strategySchema } from './spec/strategy-schema';
import { variantSchema } from './spec/variant-schema';

export const createOpenApiSchema = (
    serverUrl?: string,
): Omit<OpenAPIV3.Document, 'paths'> => {
    return {
        openapi: '3.0.3',
        servers: serverUrl ? [{ url: serverUrl }] : [],
        info: {
            title: 'Unleash API',
            version: process.env.npm_package_version,
        },
        security: [
            {
                apiKey: [],
            },
        ],
        components: {
            securitySchemes: {
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                },
            },
            schemas: {
                constraintSchema,
                createFeatureSchema,
                featureSchema,
                featuresSchema,
                overrideSchema,
                parametersSchema,
                strategySchema,
                variantSchema,
            },
        },
    };
};
