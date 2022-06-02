import { OpenAPIV3 } from 'openapi-types';
import { schemas } from './spec';

export interface AdminApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['admin'];
}

export interface ClientApiOperation
    extends Omit<OpenAPIV3.OperationObject, 'tags'> {
    tags: ['client'];
}

export const createRequestSchema = (
    schemaName: keyof typeof schemas,
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
    schemaName: keyof typeof schemas,
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
