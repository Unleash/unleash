import { OpenAPIV3 } from 'openapi-types';

export const strategiesResponse: OpenAPIV3.ResponseObject = {
    description: 'strategiesResponse',
    content: {
        'application/json': {
            schema: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/strategySchema',
                },
            },
        },
    },
};
