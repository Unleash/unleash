import { OpenAPIV3 } from 'openapi-types';

export const tagsResponse: OpenAPIV3.ResponseObject = {
    description: 'tagsResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/tagsResponseSchema',
            },
        },
    },
};
