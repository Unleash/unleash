import { OpenAPIV3 } from 'openapi-types';

export const updateFeatureVariantsRequest: OpenAPIV3.RequestBodyObject = {
    required: true,
    content: {
        'application/json': {
            schema: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/variantSchema',
                },
            },
        },
    },
};
