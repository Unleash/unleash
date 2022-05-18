import { OpenAPIV3 } from 'openapi-types';

export const emptyResponse: OpenAPIV3.ResponseObject = {
    description: 'emptyResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/emptyResponseSchema',
            },
        },
    },
};
