import { OpenAPIV3 } from 'openapi-types';

export const featureResponse: OpenAPIV3.ResponseObject = {
    description: 'featureResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/featureSchema',
            },
        },
    },
};
