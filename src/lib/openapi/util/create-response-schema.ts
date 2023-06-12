import { OpenAPIV3 } from 'openapi-types';

export const createResponseSchemas = (
    description: string,
    content: { [media: string]: OpenAPIV3.MediaTypeObject },
): OpenAPIV3.ResponseObject => {
    return {
        description,
        content: content,
    };
};

export const schemaNamed = (schemaName: string): OpenAPIV3.MediaTypeObject => {
    return {
        schema: {
            $ref: `#/components/schemas/${schemaName}`,
        },
    };
};

export const schemaTyped = (
    type: OpenAPIV3.NonArraySchemaObjectType,
): OpenAPIV3.MediaTypeObject => {
    return {
        schema: {
            type,
        },
    };
};

export const createResponseSchema = (
    schemaName: string,
): OpenAPIV3.ResponseObject => {
    return createResponseSchemas(schemaName, {
        'application/json': schemaNamed(schemaName),
    });
};

export const createCsvResponseSchema = (
    schemaName: string,
    example: string,
): OpenAPIV3.ResponseObject => {
    return createResponseSchemas(schemaName, {
        'text/csv': { example, ...schemaTyped('string') },
    });
};

export const resourceCreatedResponseSchema = (
    schemaName: string,
): OpenAPIV3.ResponseObject => {
    return {
        headers: {
            location: {
                description: 'The location of the newly created resource.',
                schema: {
                    type: 'string',
                    format: 'uri',
                },
            },
        },
        description: `The resource was successfully created.`,
        content: {
            'application/json': {
                schema: {
                    $ref: `#/components/schemas/${schemaName}`,
                },
            },
        },
    };
};
