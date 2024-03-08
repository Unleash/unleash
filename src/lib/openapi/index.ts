import { OpenAPIV3 } from 'openapi-types';

import { IServerOption } from '../types';
import { mapValues, omitKeys } from '../util';
import { openApiTags } from './util';
import { URL } from 'url';
import apiVersion from '../util/version';

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
import * as importedSchemas from './spec';
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
