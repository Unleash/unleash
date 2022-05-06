import { OpenAPIV3 } from 'openapi-types';

export const patchRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/patchSchema',
            },
        },
    },
};
