import { OpenAPIV3 } from 'openapi-types';

export const featureVariantsResponse: OpenAPIV3.ResponseObject = {
    description: 'featureVariantResponse',
    content: {
        'application/json': {
            schema: {
                $ref: '#/components/schemas/featureVariantsSchema',
            },
        },
    },
};
