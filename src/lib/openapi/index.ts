import type { OpenAPIV3 } from 'openapi-types';

import type { IServerOption } from '../types/index.js';
import { mapValues, omitKeys } from '../util/index.js';
import { openApiTags } from './util/index.js';
import { URL } from 'node:url';
import apiVersion from '../util/version.js';

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

/*
 * All schemas in `openapi/spec` should be listed here.
 * Instead of listing them all maunally, exclude those that are not schemas (maybe they should be moved elsewhere)
 */
import * as importedSchemas from './spec/index.js';
const {
    constraintSchemaBase,
    unknownFeatureEvaluationResult,
    playgroundStrategyEvaluation,
    strategyEvaluationResults,
    ...exportedSchemas
} = importedSchemas;
export const schemas: UnleashSchemas = exportedSchemas;

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
        security: [{ apiKey: [] }, { bearerToken: [] }],
        components: {
            securitySchemes: {
                // https://swagger.io/docs/specification/authentication/api-keys/
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: 'API key needed to access this API',
                },
                // https://swagger.io/docs/specification/authentication/bearer-authentication/
                bearerToken: {
                    type: 'http',
                    scheme: 'bearer',
                    description:
                        'API key needed to access this API, in Bearer token format',
                },
            },
            schemas: mapValues(schemas, removeJsonSchemaProps),
        },
        tags: openApiTags,
    };
};
export * from './util/index.js';
export * from './spec/index.js';
