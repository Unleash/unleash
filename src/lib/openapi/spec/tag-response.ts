import { OpenAPIV3 } from 'openapi-types';

export const tagResponse: OpenAPIV3.ResponseObject = {
    description: 'tagResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/tagSchema',
            },
        },
    },
};
