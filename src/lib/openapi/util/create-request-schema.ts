import type { OpenAPIV3 } from 'openapi-types';

export const createRequestSchema = (
    schemaName: string,
): OpenAPIV3.RequestBodyObject => {
    return {
        description: schemaName,
        required: true,
        content: {
            'application/json': {
                schema: {
                    $ref: schemaName.startsWith('#')
                        ? schemaName
                        : `#/components/schemas/${schemaName}`,
                },
            },
        },
    };
};
